const Alias = require("./model/alias");

class Handler{
    constructor(command, args, data) {
        this.command = command;
        this.args = args;
        this.data = data;
    }
    
    async handle() {
        let command = await Alias.get(this.command, 'command');
        if(route[command] != undefined) {
            let handler = new route[command]();
            return handler.handle(this.args,this.data);
        }
    }
}

module.exports = Handler;