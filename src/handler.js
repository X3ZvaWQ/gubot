const Alias = require("./model/alias");

class Handler{
    constructor(command, args) {
        this.command = command;
        this.args = args;
    }
    
    async handle() {
        let command = await Alias.get(this.command, 'command');
        if(route[command] != undefined) {
            let handler = new route[command]();
            return handler.handle(this.args);
        }else{
            return "ERROR:Unknown command! Please contact administrator.\n错误:未知命令！请联系管理员。";
        }
    }
}

module.exports = Handler;