const Alias = require("../model/alias");

class Bot{
    async handleCommand(data) {
        let [args, command] = await this.parseArgs(data);
        let ctx = {
            state: {
                command: command,
                args: args
            }
        }
        if(route[command] != undefined) {
            let handler = new route[command]();
            return handler.handle(ctx);
        }
    }

    async handleMessage(data) {
        //TODO
        return null;
    }

    async parseArgs(data) {
        if(data.post_type == 'message'){
            if(data.message.split('')[0] == '/'){
                let [command, defaultArgs, shortArgs, longArgs] = helper.commandParse(data.message);
                command = await Alias.get(command, 'command');
                if(route[command] != undefined) {
                    let argsList = route[command].argsList();
                    let args = {};
                    if(argsList != undefined && argsList != null){
                        for(let i in argsList) {
                            let arg = argsList[i];
                            let value = undefined;
                            if(shortArgs != null && shortArgs[arg.shortArgs] != undefined) {
                                value = shortArgs[arg.shortArgs];
                            }
                            if(longArgs != null && longArgs[arg.longArgs] != undefined) {
                                value = longArgs[arg.longArgs];
                            }
    
                            if(value == undefined) {
                                value = defaultArgs[arg.defaultIndex - 1];
                            }
    
                            if(value == undefined || value == null || value == '-'){
                                if(arg.nullable) {
                                    value = arg.default;
                                }else{
                                    ctx.response.type = 'application/json',
                                    ctx.response.body = JSON.stringify({
                                        reply: route[command].argsMissingError()
                                    });
                                    return;
                                }
                            }
    
                            if(typeof arg.limit == 'object' && arg.type == 'integer'){
                                if(value < arg.limit[0] || value > arg.limit[1]){
                                    throw 'Args Error.';
                                }
                            }
    
                            if(arg.alias != null && value != null) {
                                value = await Alias.get(value, arg.alias);
                            }
    
                            args[arg.name] = value;
                        }
                    }
                    return [args, command];
                }else{
                    return ;
                }
            }
        }
    }
}

module.exports = Bot;