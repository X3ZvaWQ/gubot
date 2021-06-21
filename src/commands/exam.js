const Api = require('../service/api');

module.exports = class ExamHandler {
    async handle(ctx) {
        let args = ctx.args;
        let qa = await Api.getExamAnswer(args['key']);
        let text = '------------------\n';
        for (let i in qa) {
            text = text + `Q: ${i}
            A: ${qa[i]}
            ------------------
            `
        }
        return text.replace(/[ ]{2,}/g, "");;
    }

    static argsList() {
        return [{
            name: 'key',
            alias: null,
            displayName: '试题关键词',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'key',
            limit: null,
            nullable: false
        }];
    }
}