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
        }
    }
}

module.exports = Handler;