const yargs_parser = require('yargs-parser');

class Bot{
    constructor(ENV) {
        this.ENV = ENV;
    }
    
    async initRedis(env) {
        if(env.enable){
            const redis = require('async-redis');
            const client = redis.createClient({
                host: env.host || 'localhost',
                port: env.port || 6379
            });
            client.on("error", function (err) {
                console.log("Redis Error: " + err);
            });
            this.redis = client;
        }else{
            this.redis = new Proxy({}, {
                get: () => (async () => null),
            });
        }
        console.log('Redis: init successed'.yellow);
    }

    async initSequelize(env) {
        const Sequelize = require('sequelize');
        const sequelize = new Sequelize(env.database, env.username, env.password, {
            logging: env.logging || false,
            dialect: env.dialect,
            host: env.host,
            port: env.port
        });
        this.sequelize = sequelize;
        console.log('Sequelize: init successed'.yellow);
    }

    async initImageGenerator(enable) {
        if(enable) {
            const ImageGenerator = require('./imageGenerator');
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch();
            this.imageGenerator = new ImageGenerator(browser);
        }else{
            this.imageGenerator = new Proxy({}, {
                get: () => (async () => 'ImageGenerator has been closed. Please check env.json/enable_puppeteer'),
            });
        }
        console.log('ImageGenerator: init successed'.yellow);
    }

    async initCqhttps(env) {
        this.cqhttps = [];
        const Cqhttp = require('./cqhttp');
        for(let cqhttp_config of env){
            let cqhttp = new Cqhttp(cqhttp_config, this);
            cqhttp.onMessage = function() {

            }
            this.cqhttps.push(cqhttp);
            console.log(`Cqhttp: [${cqhttp.name}] init successed`.yellow);
        }
    }

    async initCommands() {
        this.route = require('../commands/index');
        console.log(`Bot: command list init successed`.yellow);
    }

    async start() {
        console.log(`Bot: all init successed.`.yellow);
    }

    async handleRequest(request) {
        if(request.post_type == 'message') {
            let result;
            if(request.message.split('')[0] == '/'){
                result = await this.handleCommand(request);
            }else{
                result = await this.handleMessage(request);
            }
            if(result != null && result != undefined && result != ''){
                return result;
            }
        }
        if(request.post_type == 'request') {
            //加好友申请
            if(request.request_type == 'friend') {
                if(!this.ENV.agree_friend_invite) {
                    return false;
                }
                //接受申请
                return {
                    action: "set_friend_add_request",
                    params: {
                        flag: request.flag,
                        approve: true
                    }
                }
            }
            //邀请入群
            if(request.request_type == 'group' && request.sub_type == 'invite') {
                if(!this.ENV.agree_group_invite) {
                    return false;
                }
                const Group = require('../model/group');
                let group = await Group.findOne({
                    where: {
                        group_id: request.group_id
                    }
                });
                if(group == null) {
                    group = await Group.create({
                        group_id: request.group_id,
                        groupname: request.group_id,
                        server: '唯我独尊'
                    });
                }
                //接受申请
                return {
                    action: "set_group_add_request",
                    params: {
                        flag: request.flag,
                        sub_type: 'invite',
                        approve: true
                    }
                };
            }
        }
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
                    ctx['permission'] = await this.checkPermission(data);
                }
                let handler = new this.route[command]();
                return await handler.handle(ctx);
            }
        }catch(e) {
            if(typeof e == 'object') {
                console.log(e.stack || e);
            }
            return e + '\n' + data.message;
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

            '^帮助$': '/help',
            '^帮助\\s(\\S*)$': '/help $1',
            //'^(\\S*)\\s?帮助$': '/help $1',

            '^花价\\s([\\S\\s]*)$': '/flowerPrice $1',
            '^科举\\s([\\S\\s]+)$': '/exam $1',

            '^金价\\s(\\S*)$': '/goldPrice $1',
            //'^(\\S*)\\s?金价$': '/goldPrice $1',

            '^开服\\s([\\S\\s]*)$': '/serverStatus $1',
            '^开服$': '/serverStatus',
            //'^([\\S\\s]*)\\s?开服$': '/serverStatus $1',

            //'^(\\S+)\\s?(攻略|成就)$': '/achievement $1',
            '^(攻略|成就)\\s(\\S*)$': '/achievement $2',

            '^更新|游戏更新$': '/gameUpdate',
            '^日常|游戏日常$': '/daily',

            //'^(\\S*)\\s?小药$': '/reinforcement $1',
            '^小药\\s(\\S*)$': '/reinforcement $1',

            //'^(\\S*)\\s?阵眼$': '/eye $1',
            '^阵眼\\s(\\S*)$': '/eye $1',

            '^(奇遇|查询)\\s([\\S\\s]*)$': '/serendipity $2',

            '^(沙盘|阵营沙盘)\\s(\\S*)$': '/sandbox $2',
            '^(沙盘|阵营沙盘)$': '/sandbox',
            //'^(\\S*)\\s?(沙盘|阵营沙盘)$': '/sandbox $1',

            '^器物谱\\s(\\S*)$': '/travel $1',
            //'^(\\S*)\\s?器物谱$': '/travel $1',
            '^家具\\s(\\S*)$': '/furniture $1',
            //'^(\\S*)\\s?家具$': '/furniture $1',
            '^物价\\s(\\S+)$': '/price $1',
            //'^(\\S+)\\s?物价$': '/price $1',

            '^群昵称\\s([\\S\\s]+)': '/group groupname $1',
            '^咕咕称呼\\s([\\S\\s]+)': '/group nickname $1',
            '^群服务器\\s([\\S\\s]+)': '/group server $1',
            '^(打开|关闭|开|关)\\s(奇遇播报|开服播报|间便命令|智障对话|斗图)': '/group set $2 $1',

            '^(开团|创建团队)\\s?([\\S\\s]*)': '/team create $2',
            '^(删除团队)\\s?([\\S\s]*)': '/team delete $2',
            '^(团队列表)\\s?([\\S\\s]*)': '/team list $2',
            '^(查看团队)\\s?([\\S\\s]*)': '/team view $2',
            '^(取消报名)\\s?([\\S\\s]*)': '/team cancel $2',
            '^(团队报名)\\s?([\\S\\s]+)': '/team apply $2',
            
            '^添加别名\\s([\\S\\s]+)': '/alias add $1',
            '^删除别名\\s([\\S\\s]+)': '/alias delete $1'
        };
        if(data.group_id && data.switchs.chat) {
            let nickname = await this.redis.get(`GroupNickname:${data.group_id}`);
            if(nickname == null) {
                const Group = require('../model/group');
                nickname = (await Group.findOne({where: {group_id: data.group_id}})).nickname;
                nickname = nickname ?? '咕咕';
                await this.redis.set(`GroupNickname:${data.group_id}`, nickname);
            }
            nickname = nickname.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regex_map[`^(${nickname})\\s?([\\S\\s]+)$`] = '/chat $2';
        }
        let message = data.message.trim();
        for(let i in regex_map) {
            let regex = new RegExp(i);
            if(regex.test(message)) {
                data.message = message.replace(regex, regex_map[i]);
                return await this.handleCommand(data);
            }
        }
        return null;
    }

    async parseArgs(data) {
        const Alias = require('../model/alias');
        const Group = require('../model/group');
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
                        throw `Error: ${arg.displayName || arg.name || ''} 必填参数缺失，请使用/help命令查看命令用法`;
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
                        throw `错误: ${arg.displayName || arg.name || ''} 参数不符合规范，参数要求取值范围[${arg.limit.min}, ${arg.limit.max}](闭区间)\n请使用/help 命令查看命令用法`;
                    }
                }
                if(arg.limit instanceof Array && arg.type == 'string'){
                    if(arg.limit.indexOf(`${value}`) == -1){
                        throw `错误: ${arg.displayName || arg.name || ''} 参数不符合规范，参数要求取值为{${arg.limit.join(',')}}中的一个, 你输入了[${value}]\n请使用/help 命令查看命令用法`;
                    }
                }
                if(arg.limit && arg.limit.min != undefined && arg.limit.max != undefined && arg.type == 'string'){
                    if(typeof value != 'string' || value.length < arg.limit.min || value.length > arg.limit.max){
                        throw `错误: ${arg.displayName || arg.name || ''} 参数不符合规范，参数要求字符串长度在[${arg.limit.min},${arg.limit.max}](闭区间)之间\n请使用/help 命令查看命令用法`;
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
        const User = require('../model/user');
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
        const Group = require('../model/group');
        let funcs = ['convenient', 'chat', 'server_broadcast', 'serendipity_broadcast', 'meme'];
        if(data.group_id) {
            let group = null;
            let result = {};
            for(let i in funcs) {
                let func = funcs[i];
                let redis_key = `GroupFunc:${func}:${data.group_id}`;
                let boolean = await this.redis.get(redis_key);
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