const Alias = require("../model/alias");
const User = require('../model/user');
const Group = require('../model/group');
const yargs_parser = require('yargs-parser');
const commandsRoute = require('../commands');

class Bot{
    constructor() {
        this.route = commandsRoute;
    }

    async handleCommand(data) {
        try{
            let [args, command] = await this.parseArgs(data) ?? [];
            let ctx = {
                command: command,
                args: args,
                data: data
            }
            if(this.route[command] != undefined) {
                if(this.route[command].demandPermission){
                    ctx['permission'] = this.permissionJudge(data);
                }
                let handler = new this.route[command]();
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
        if(data.group_id) {
            let redis_key = `GroupConvenient:${data.group_id}`;
            let boolean = await redis.get(redis_key);
            if(boolean == null){
                let group = await Group.findOne({
                    where: {
                        group_id: data.group_id
                    }
                });
                if(group != null) {
                    boolean = `${group.convenient}`
                    await redis.set(redis_key, boolean);
                }else{
                    await redis.set(redis_key, 'true');
                }
            };
            if(boolean == 'false') {
                return null
            }
        }
        let alias = {
            宏: '/macro',
            帮助: '/help',
            花价: '/flowerPrice',
            科举: '/exam',
            金价: '/goldPrice',
            开服: '/serverStatus',
            攻略: '/achievement',
            更新: '/gameUpdate',
            日常: '/daily',
            小药: '/reinforcement',
            阵眼: '/eye',
            奇遇: '/serendipity',
            沙盘: '/sandbox',
            家具: '/furniture',
            器物谱: '/travel',
            群昵称: '/group nickname',
            创建团队: '/team create',
            删除团队: '/team delete',
            团队列表: '/team list',
            查看团队: '/team view',
            取消报名: '/team cancel',
            团队报名: '/team apply',
            群服务器: '/group server',
            简便命令: '/group convenient',
            添加别名: '/alias add',
            删除别名: '/alias delete',
        };
        let message = data.message;
        for(let i in alias) {
            if(message.indexOf(i) === 0) {
                data.message = message.replace(i, alias[i]);
                return await this.handleCommand(data);
            }
        }
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
                if(arg.type == 'server' && value == '-'){
                    if(data.group_id) {
                        let group = await Group.findOne({
                            where: {
                                group_id: data.group_id
                            }
                        });
                        if(group != null) {
                            value = group.server;
                        }else{
                            value = '唯我独尊'
                        }
                    }else{
                        value = '唯我独尊'
                    }
                }

                if(arg.alias != null && value != null) {
                    let _value = value;
                    value = await Alias.get(value, arg.alias, data.group_id);
                    if(value == _value) value = await Alias.get(value, arg.alias, '*');
                }
                if(arg.limit instanceof Object && arg.type == 'integer'){
                    if(value < arg.limit.min || value > arg.limit.max){
                        throw `Error: ${arg.name} 参数不符合规范，请使用/help 命令查看命令用法`;
                    }
                }
                if(arg.limit instanceof Array && arg.type == 'string'){
                    if(arg.limit.indexOf(value) == -1){
                        throw `Error: ${arg.name} 参数不符合规范，请使用/help 命令查看命令用法`;
                    }
                }
                if(arg.limit && arg.limit.min != undefined && arg.limit.max != undefined && arg.type == 'string'){
                    console.log(arg.limit, value, value.length);
                    if(typeof value != 'string' || value.length < arg.limit.min || value.length > arg.limit.max){
                        throw `Error: ${arg.name} 参数不符合规范，请使用/help 命令查看命令用法`;
                    }
                }
                return value;
            }
            if(this.route[command] != undefined) {
                let argsList = this.route[command].argsList();
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