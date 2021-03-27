const Api = require('../service/api');

module.exports = class ChatHandler {
    async handle(ctx) {
        let message = ctx.args.message;
        let answer = await Api.getChatAnswer(message);
        return text.replace(/[ ]{2,}/g, "");;
    }

    static argsList() {
        return [{
            name: 'message',
            alias: null,
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'message',
            limit: null,
            nullable: true
        }];
    }
}