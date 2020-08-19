class Handler{
    constructor(command, args) {
        this.command = command;
        this.args = args;
    }
    
    async handle() {
        if(route[this.command] != undefined) {
            let handler = new route[this.command]();
            return handler.handle(this.args);
        }
    }
}

module.exports = Handler;