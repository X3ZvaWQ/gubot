const CqHttp = require('../../service/cqhttp');
const User = require('../../model/user');
const { isNumber } = require('lodash');

module.exports = class MuteHandler {
    name = "Mute";

    args = [{
        name: 'user',
        alias: null,
        displayName: '@群内用户',
        type: 'CQ',
        limit: null,
        nullable: true,
        default: '-'
    },
    {
        name: 'time',
        alias: null,
        displayName: '持续时间(秒),最多180秒',
        type: 'integer',
        limit: null,
        nullable: true,
        default: '-'
    }];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            (data.message.startsWith('/mute ') ||
                data.message.startsWith('禁言 ') ||
                data.message.startsWith('口球 ') ||
                data.message.startsWith('我想静静'))
        ), this);
    }

    async handle(event) {
        let data = event.data;
        let user = event.user;
        let args = event.args;

        if (data.message_type == 'private') return;

        let targetQQ;
        if (args.user == '-') {
            targetQQ = user.qq;
        } else {
            let regexResult = /qq=(\d+)/.exec(args.user);
            if (regexResult[1]) {
                targetQQ = regexResult[1];
            } else {
                return CqHttp.sendGroupMessage(`错误: 请在第二个参数艾特群内成员`, data.group_id);
            }
        }

        let time = args.time;
        let overflow;
        if (time === '-') {
            //0-3分钟随机
            time = Math.round((Math.random() * 60 * 3))
        } else {
            time = parseInt(time);
            if (time >= 180) {
                overflow = time - 180 > 180 ? 180 : time - 180;
                time = 180;
            }
        }

        if (targetQQ != user.qq && user.power < 4096) return;
        let targetUser = await User.findOne({ where: { qq: targetQQ } });
        let opr_nickname = user ? user.nickname : data.user_id;
        let target_nickname = targetUser ? targetUser.nickname : targetQQ;
        if (targetQQ == user.qq) {
            return [
                CqHttp.setGroupBan(data.group_id, targetQQ, time),
                CqHttp.sendGroupMessage(`${target_nickname} 陷入了玉玉中不想说话, 似乎过 ${time} 秒才能缓过劲来`, data.group_id)
            ];
        } else {
            if (isNumber(overflow) && overflow > 0) {
                return [
                    CqHttp.setGroupBan(data.group_id, targetQQ, time),
                    CqHttp.sendGroupMessage(`${opr_nickname} 禁言了 ${target_nickname}, 持续时间 ${time} 秒`, data.group_id),
                    CqHttp.delayRequest(
                        CqHttp.sendGroupMessage(`禁言超时, 多余的 ${overflow} 秒由操作者 ${opr_nickname} 承担`, data.group_id)
                        , 2000),
                    CqHttp.delayRequest(
                        CqHttp.setGroupBan(data.group_id, user.qq, overflow)
                        , 2000)
                ];
            } else {
                return [
                    CqHttp.setGroupBan(data.group_id, targetQQ, time),
                    CqHttp.sendGroupMessage(`${opr_nickname} 禁言了 ${target_nickname}, 持续时间 ${time} 秒`, data.group_id)
                ];
            }
        }

    }
}