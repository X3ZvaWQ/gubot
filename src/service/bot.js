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
                    ctx['permission'] = this.checkPermission(data);
                }
                let handler = new this.route[command]();
                return await handler.handle(ctx);
            }
        }catch(e) {
            console.log(e);
            if(typeof(e) != 'string') {
                return '机器人内部错误, 如果可以的话, 请加群116523057反馈';
            }else{
                return e;
            }
        }
        
    }

    async handleMessage(data) {
        if(data.group_id) {
            data.switchs = await this.checkFunctionSwitch(data);
            if(!data.switchs.convenient) {
                return null;
            }
        }
        let regex_map = {
            //'^(\\S+)\\s?宏$': '/macro $1',
            '^宏\\s(\\S+)$': '/macro $1',

            '^骚话$': '/saohua',

            '^帮助\\s?(\\S*)$': '/help $1',
            '^(\\S*)\\s?帮助$': '/help $1',

            '^花价\\s?([\\S\\s]*)$': '/flowerPrice $1',
            '^科举\\s?([\\S\\s]+)$': '/exam $1',

            '^金价\\s?(\\S*)$': '/goldPrice $1',
            '^(\\S*)\\s?金价$': '/goldPrice $1',

            '^开服\\s?([\\S\\s]*)$': '/serverStatus $1',
            //'^([\\S\\s]*)\\s?开服$': '/serverStatus $1',

            //'^(\\S+)\\s?(攻略|成就)$': '/achievement $1',
            '^(攻略|成就)\\s?(\\S*)$': '/achievement $2',

            '^更新|游戏更新$': '/gameUpdate',
            '^日常|游戏日常$': '/daily',

            '^(\\S*)\\s?小药$': '/reinforcement $1',
            '^小药\\s?(\\S*)$': '/reinforcement $1',

            '^(\\S*)\\s?阵眼$': '/eye $1',
            '^阵眼\\s?(\\S*)$': '/eye $1',

            '^(奇遇|查询)\\s?([\\S\\s]*)$': '/serendipity $2',

            '^(沙盘|阵营沙盘)\\s?(\\S*)$': '/sandbox $2',
            '^(\\S*)\\s?(沙盘|阵营沙盘)$': '/sandbox $1',

            '^器物谱\\s?(\\S*)$': '/travel $1',
            //'^(\\S*)\\s?器物谱$': '/travel $1',
            '^家具\\s?(\\S*)$': '/furniture $1',
            //'^(\\S*)\\s?家具$': '/furniture $1',
            '^物价\\s?(\\S+)$': '/price $1',
            //'^(\\S+)\\s?物价$': '/price $1',

            '^群昵称\\s?([\\S\\s]+)': '/group groupname $1',
            '^咕咕称呼\\s?([\\S\\s]+)': '/group nickname $1',
            '^群服务器\\s?([\\S\\s]+)': '/group server $1',
            '^(打开|关闭|开|关)\\s?(奇遇播报|开服播报|间便命令|智障对话|斗图)': '/group set $2 $1',

            '^(开团|创建团队)\\s?([\\S\\s]*)': '/team create $2',
            '^(删除团队)\\s?([\\S\s]*)': '/team delete $2',
            '^(团队列表)\\s?([\\S\\s]*)': '/team list $2',
            '^(查看团队)\\s?([\\S\\s]*)': '/team view $2',
            '^(取消报名)\\s?([\\S\\s]*)': '/team cancel $2',
            '^(团队报名)\\s?([\\S\\s]+)': '/team apply $2',
            
            '^添加别名\\s?([\\S\\s]+)': '/alias add $1',
            '^删除别名\\s?([\\S\\s]+)': '/alias delete $1'
        };
        if(data.group_id && data.switchs.chat) {
            let nickname = await redis.get(`GroupNickname:${data.group_id}`);
            if(nickname == null) {
                nickname = (await Group.findOne({where: {group_id: data.group_id}}));
                if(nickname != null) {
                    nickname = nickname.nickname;
                }else{
                    nickname = '咕咕'
                }
                await redis.set(`GroupNickname:${data.group_id}`, nickname);
            }
            nickname = nickname.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regex_map[`^(${nickname})\\s?([\\S\\s]+)$`] = '/chat $2';
        }
        let message = data.message.trim();
        for(let i in regex_map) {
            let regex = new RegExp(i);
            if(regex.test(message)) {
                data.message = message.replace(regex, regex_map[i]);
                console.log(data.message)
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

    async checkPermission(data) {
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

    async checkFunctionSwitch(data) {
        let funcs = ['convenient', 'chat', 'server_broadcast', 'serendipity_broadcast', 'meme'];
        if(data.group_id) {
            let group = null;
            let result = {};
            for(let i in funcs) {
                let func = funcs[i];
                let redis_key = `GroupFunc:${func}:${data.group_id}`;
                let boolean = await redis.get(redis_key);
                if(boolean == null){
                    if(group == null) {
                        group = await Group.findOne({
                            where: {
                                group_id: data.group_id
                            }
                        });
                        if(group == null) {
                            group = await Group.create({
                                group_id: data.group_id,
                                server: '唯我独尊',
                                nickname: '咕咕',
                                groupname: data.group_id
                            });
                        }
                    }
                    boolean = `${group[func]}`;
                };
                result[func] = boolean == 'true';
            }
            return result;
        }else{
            return {};
        }

    }
}

module.exports = Bot;