const Alias = require('../model/alias');
const route = require('../route');

module.exports = async (ctx, next) => {
    const data = ctx.request.body;
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
                        if(value != undefined) {
                            value = defaultArgs[arg.defaultArgs];
                        }

                        if(value == undefined || value == null){
                            value = arg.default;
                        }

                        if(arg.alias != null) {
                            value = await Alias.get(value, arg.alias);
                        }

                        args[arg.name] = value;
                    }
                }
                ctx.state.args = args;
                ctx.state.command = command;
            }else{
                return ;
            }
        }
    }
    await next();
}