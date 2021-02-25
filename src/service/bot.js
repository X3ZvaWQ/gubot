const Alias = require("../model/alias");
const User = require('../model/user');
const yargs_parser = require('yargs-parser');

class Bot{
    async handleCommand(data) {
        try{
            let [args, command] = await this.parseArgs(data);
            let ctx = {
                command: command,
                args: args,
                data: data
            }
            if(route.commands[command] != undefined) {
                if(route.commands[command].demandPermission){
                    ctx['permission'] = this.permissionJudge(data);
                }
                let handler = new route.commands[command]();
                return await handler.handle(ctx);
            }
        }catch(e) {
            console.log(e);
            if(typeof(e) == 'string') {
                return e;
            }else{
                return '机器人内部错误';
            }
        }
        
    }

    async handleMessage(data) {
        //TODO
        return null;
    }
    
    async parseArgs(data) {
        if(data.post_type == 'message' && data.message.split('')[0] == '/'){
            let allArgs = yargs_parser(data.message);
            let defaultArgs = allArgs['_'];
            let _command = defaultArgs.shift().substr(1);
            let command = await Alias.get(_command, 'command', data.group_id);
            if(command == _command) command = await Alias.get(command, 'command');
            const getArg = async (arg, defaultArgs, allArgs, data) => {
                let value = undefined;
                if(allArgs != null && allArgs[arg.longArgs] != undefined) {
                    value = allArgs[arg.longArgs];
                }
                if(value == undefined) {
                    value = defaultArgs[arg.defaultIndex - 1];
                }
                if(value == undefined || value == null || value == '-'){
                    if(arg.nullable) {
                        value = arg.default;
                    }else{
                        throw `Error: ${arg.name} 参数缺失，请使用/help命令查看命令用法`;
                    }
                }

                if(arg.alias != null && value != null) {
                    let _value = value;
                    value = await Alias.get(value, arg.alias, data.group_id);
                    if(value == _value) value = await Alias.get(value, arg.alias, '*');
                }
                if(arg.limit instanceof Object && arg.type == 'integer'){
                    if(value < arg.limit.min || value > arg.limit.max){
                        throw `Error: ${arg.name} 参数不符合规范，请使用/help命令查看命令用法`;
                    }
                }
                if(arg.limit instanceof Array && arg.type == 'string'){
                    if(arg.limit.indexOf(value) == -1){
                        throw `Error: ${arg.name} 参数不符合规范，请使用/help命令查看命令用法`;
                    }
                }
                if(arg.limit && arg.limit.min != undefined && arg.limit.max != undefined && arg.type == 'string'){
                    console.log(arg.limit, value, value.length);
                    if(typeof value != 'string' || value.length < arg.limit.min || value.length > arg.limit.max){
                        throw `Error: ${arg.name} 参数不符合规范，请使用/help命令查看命令用法`;
                    }
                }
                return value;
            }
            if(route.commands[command] != undefined) {
                let argsList = route.commands[command].argsList();
                let args = {};
                
                if(argsList instanceof Array) {
                    try{
                        for(let i in argsList) {
                            let value = await getArg(argsList[i], defaultArgs, allArgs, data);
                            args[argsList[i].name] = value;
                        }
                    }catch(e) {
                        throw e;
                    }
                }else if(argsList instanceof Object){
                    try{
                        let action = await getArg(argsList.action, defaultArgs, allArgs, data);
                        args[argsList.action.name] = action;
                        let branchArgsList = argsList.branch[action];
                        for(let i in branchArgsList) {
                            let value = await getArg(branchArgsList[i], defaultArgs, allArgs, data);
                            args[branchArgsList[i].name] = value;
                        }
                    }catch(e) {
                        throw e;
                    }
                }
                return [args, command];
            }else{
                return [null, null];
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