module.exports = class ExamHandler{
    async handle(args, data) {
        let time = helper.getJX3DayStart();
        if(args[0] == undefined) {
            return 'ERROR: Empty search key.\n错误: 请输入科举试题的连续几个字。'
        }
        let params = {
            key: args[0]
        }

        let qa = await helper.getExamAnswer(params['key']);
            

        let text = '------------------\n';
        for(let i in qa) {
            text = text + `Q: ${i}
            A: ${qa[i]}
            ------------------
            `
        }
        return text.replace(/[ ]{2,}/g,"");;
    }

    static helpText() {
        return `科举查询命令，可用命令有科举、kj以及群管理员自定义的别名。接受1个参数
            1.关键字，输入你看到的题目中的连续几个字即可
        `.replace(/[ ]{2,}/g,"");
    }
}