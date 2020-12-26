const Alias = require("./model/alias");

class Handler{
    constructor(ctx) {
        this.ctx = ctx
    }
    
    async handle() {
        //get commands
        let command = this.ctx.state.command;
        if(route[command] != undefined) {
            let handler = new route[command]();
            return handler.handle(this.ctx);
        }
    }
}

module.exports = Handler;