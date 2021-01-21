const Alias = require("../model/alias");
const User = require('../model/user');

class Bot{
    async handleCommand(data) {
        let args;
        let command;
        try{
            [args, command] = await this.parseArgs(data);
        }catch(e) {
            return e;
        }
        let ctx = {
            command: command,
            args: args,
            data: data
        }
        if(route[command] != undefined) {
            if(route[command].demandPermission){
                ctx['permission'] = this.permissionJudge(data);
            }
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
                const getArg = async (arg, defaultArgs, shortArgs, longArgs) => {
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

                    if(arg.alias != null && value != null) {
                        value = await Alias.get(value, arg.alias);
                    }

                    if(arg.limit instanceof Object && arg.type == 'integer'){
                        if(value < arg.limit.min || value > arg.limit.max){
                            throw 'Invalid Args.';
                        }
                    }

                    if(arg.limit instanceof Array && arg.type == 'string'){
                        if(arg.limit.indexOf(value) == -1){
                            throw 'Invalid Args.';
                        }
                    }

                    return value;
                }
                if(route[command] != undefined) {
                    let argsList = route[command].argsList();
                    let args = {};
                    
                    if(argsList instanceof Array) {
                        try{
                            for(let i in argsList) {
                                let value = await getArg(argsList[i], defaultArgs, shortArgs, longArgs);
                                args[argsList[i].name] = value;
                            }
                        }catch(e) {
                            throw e;
                        }
                    }else if(argsList instanceof Object){
                        try{
                            let action = await getArg(argsList.action, defaultArgs, shortArgs, longArgs);
                            args[argsList.action.name] = action;
                            let branchArgsList = argsList.branch[action];
                            for(let i in branchArgsList) {
                                let value = await getArg(branchArgsList[i], defaultArgs, shortArgs, longArgs);
                                args[branchArgsList[i].name] = value;
                            }
                        }catch(e) {
                            throw e;
                        }
                    }
                    return [args, command];
                }else{
                    return ;
                }
            }
        }
    }

    async permissionJudge(data) {
        if(data.message_type == 'private') {
            let user = await User.findOne({
                where: {
                    qq: data.user_id,
                    group: "*"
                }
            })
            if(user != null) {
                return user.permissions;
            }else{
                return 1;
            }
        }else if(data.message_type == 'group') {
            let user = await User.findOne({
                where: {
                    qq: data.user_id,
                    group: data.group_id
                }
            })
            if(user != null) {
                return user.permissions;
            }
            if(data.sender && data.sender.role == 'owner'){
                await User.create({
                    qq: data.sender.user_id,
                    nickname: data.sender.card || data.sender.nickname || data.sender.user_id,
                    group: data.group_id,
                    permissions: 4
                });
                return 4;
            }
            return 1;
        }else {
            return 0;
        }
    }
}

module.exports = Bot;