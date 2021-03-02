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
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'key',
            limit: null,
            nullable: false
        }];
    }

    static helpText() {
        return `科举查询命令，可用命令有科举、kj以及群管理员自定义的别名。接受1个参数
            1.关键字，输入你看到的题目中的连续几个字即可
        `.replace(/[ ]{2,}/g, "");
    }
}