const Api = require('../service/api');
const Group = require('../model/group');
const Tencentcloud = require('../service/httpApi/tencentcloud');

module.exports = class ChatHandler {
    async handle(ctx) {
        let message = ctx.args.message;
        let nickname;
        if(ctx.data.group_id != undefined) {
            nickname = await bot.redis.get(`GroupNickname:${ctx.data.group_id}`);
            if(nickname == null) {
                nickname = (await Group.findOne({where: {group_id: ctx.data.group_id}})).nickname;
                await bot.redis.set(`GroupNickname:${ctx.data.group_id}`, nickname);
            }
        }else{
            nickname = '咕咕'
        }
        let answer = await Tencentcloud.chat(message, nickname);
        return answer;
    }

    static argsList() {
        return [{
            name: 'message',
            alias: null,
            displayName: '消息',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'message',
            limit: null,
            nullable: false
        }];
    }
}