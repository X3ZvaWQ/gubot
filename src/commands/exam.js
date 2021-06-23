const Jx3box = require('../service/httpApi/jx3box');

module.exports = class ExamHandler {
    async handle(ctx) {
        let args = ctx.args;
        let qa = await Jx3box.exam(args['key']);
        let qa_texts = []
        for (let i in qa) {
            qa_texts.push(`Q: ${i}\nA: ${qa[i]}\n`);
        }
        return qa_texts.join('------\n');
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