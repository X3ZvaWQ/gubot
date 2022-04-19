const CqHttp = require('../../service/cqhttp');
const User = require('../../model/user');

module.exports = class SudoHandler {
    name = "Sudo";

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
        displayName: '持续时间(秒)',
        type: 'integer',
        limit: null,
        nullable: true,
        default: 300
    }];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message.startsWith('/sudo')
        ), this);
    }

    async handle(event) {
        let data = event.data;
        let user = event.user;
        let args = event.args;

        if (user.power < 4096) return;
        if (data.message_type == 'private') return;

        let targetQQ;
        if(args.user == '-') {
            targetQQ = user.qq;
        }else{
            let regexResult = /qq=(\d+)/.exec(args.user);
            if(regexResult[1]) {
                targetQQ = regexResult[1];
            }else{
                CqHttp.sendGroupMessage(`错误: 请在第二个参数艾特群内成员`, data.group_id);
            }
        }
        let targetUser = await User.findOne({ where: { qq: targetQQ } });
        return [
            CqHttp.setGroupAdmin(data.group_id, targetQQ, true),
            CqHttp.sendGroupMessage(`${targetUser ? (targetUser.nickname || targetUser.qq) : data.user_id} 已经被带上了绿帽子, 持续时间 ${args.time} 秒`, data.group_id),
            CqHttp.delayRequest(
                CqHttp.setGroupAdmin(data.group_id, targetQQ, false), 
                args.time * 1000
            )
        ];
    }
}