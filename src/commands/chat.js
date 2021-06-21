const Api = require('../service/api');
const Group = require('../model/group');

module.exports = class ChatHandler {
    async handle(ctx) {
        let message = ctx.args.message;
        let session = ctx.data.group_id || ctx.data.user_id || 'session_undefined';
        let nickname = await redis.get(`GroupNickname:${ctx.data.group_id}`);
            if(nickname == null) {
                nickname = (await Group.findOne({where: {group_id: ctx.data.group_id}})).nickname;
                await redis.set(`GroupNickname:${ctx.data.group_id}`, nickname);
            }
        let answer = await Api.getChatAnswer(message, session, nickname);
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