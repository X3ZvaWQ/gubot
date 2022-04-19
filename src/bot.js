const yargs_parser = require('yargs-parser');
const Logger = require('./service/logger');
const Handler = require('./handler');

class Bot{
    constructor(ENV) {
        this.ENV = ENV;
        global.bot = this;
    }

    async initRedis() {
        let env = this.ENV.redis;
        let bot = this;
        if(env.enable){
            const redis = require('async-redis');
            const client = redis.createClient({
                host: env.host || 'localhost',
                port: env.port || 6379
            });
            client.on("error", function (err) {
                Logger.error("Redis Error: " + err);
            });
            this.redis = client;
        }else{
            this.redis = new Proxy({}, {
                get: () => (async () => null),
            });
        }
        Logger.success('Redis: init successed');
    }

    async initSequelize() {
        let env = this.ENV.database;
        const Sequelize = require('sequelize');
        const sequelize = new Sequelize(env.database, env.username, env.password, {
            logging: env.logging || false,
            dialect: env.dialect,
            host: env.host,
            port: env.port
        });
        this.sequelize = sequelize;
        Logger.success('Sequelize: init successed');
    }

    async initImageGenerator() {
        let env = this.ENV.puppeteer;
        if(env.enable) {
            const ImageGenerator = require('./service/imageGenerator');
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch();
            this.imageGenerator = new ImageGenerator(browser);
        }else{
            this.imageGenerator = new Proxy({}, {
                get: () => (async () => `${__dirname}/../assets/images/error/image_generator_disable.jpg`),
            });
        }
        Logger.success('ImageGenerator: init successed');
    }

    async initHandler() {
        this.handler = new Handler();
    }
    
    //TODO
    async initWebsocketApi() {
        const Jx3api = require('./service/wsApi/jx3api');
        this.jx3api_ws = new Jx3api(this.ENV.jx3api_websocket_url, 'JX3API_Websocket');
        let bot = this;
        this.jx3api_ws.handleMessageStack.push(async (message) => {
            message = JSON.parse(message);
            if(message.type == 2001 && message.data.status == 1) {
                let broadcast_msg = `咕咕咕！[${message.data.server}]开服啦！`;
                for(let cqhttp of bot.cqhttps){
                    let groups = await cqhttp.getGroupList();
                    for(let group of groups) {
                        if(group.server_broadcast && group.server == message.data.server){
                            cqhttp.sendGroupMessage(broadcast_msg, group.group_id);
                        }
                    }
                }
            }
            if(message.type == 2002) {
                let broadcast_msg = `咕咕咕！[${message.data.date}]有新的[${message.data.type}]请查收！\n标题：${message.data.title}\n链接：${message.data.url}`;
                for(let cqhttp of bot.cqhttps){
                    let groups = await cqhttp.getGroupList();
                    for(let group of groups) {
                        if(group.news_broadcast){
                            cqhttp.sendGroupMessage(broadcast_msg, group.group_id);
                        }
                    }
                }
            }
            if(message.type == 2003) {
                let broadcast_msg = `咕咕咕！${message.data.serendipity} 被 ${message.data.name} 抱回家啦~`;
                for(let cqhttp of bot.cqhttps){
                    let groups = await cqhttp.getGroupList();
                    for(let group of groups) {
                        if(group.serendipity_broadcast && group.server == message.data.server){
                            if (!group.group_serendipity_broadcast || (group.group_serendipity_broadcast && group.members.indexOf(message.data.name) > -1)) {
                                cqhttp.sendGroupMessage(broadcast_msg, group.group_id);
                            }
                        }
                    }
                }
            }
        })
    }

    async initWebsocketServer() {
        let env = this.ENV;
        if(env.websocket_server && env.websocket_server.enable) {
            const Wss = require('./service/websocketServer');
            this.wss = new Wss(env.websocket_server.port || 8080, env.websocket_server.access_token);
            this.wss.messageHandler.push(async (message, ws) => {
                return await this.handleMessage(message, ws);
            });
        }
    }

    async handleMessage(message, ws) {
        let resultSet = await this.handler.handle(message, ws);
        for(let result of resultSet){
            if(result._delay) {
                setTimeout(function(){
                    ws.send(JSON.stringify(result.request));
                }, result._delay);
            }else{
                ws.send(JSON.stringify(result));
            }
        }
    }

    async start() {
        Logger.success(`Bot: all init successed.`);
    }

    //TODO
    async _handleMessage(data, cqhttp) {
        if(data.group_id) {
            data.switchs = await this.checkFunctionSwitch(data.group_id);
            if(!data.switchs.convenient) {
                return null;
            }
        }
        let regex_map = {
            '^宏\\s([\\S\\s]+)$': '/macro $1',
            '^文字宏\\s([\\S]+)$': '/macro $1 -1',

            '^骚话$': '/saohua',
            '^语音骚话$': '/saohuav',
            '^斗图$': '/doutu',

            '^帮助$': '/help',
            '^帮助\\s(\\S*)$': '/help $1',

            '^花价\\s([\\S\\s]*)$': '/flowerPrice $1',
            '^花价$': '/flowerPrice',

            '^科举\\s([\\S\\s]+)$': '/exam $1',

            '^金价\\s(\\S*)$': '/goldPrice $1',
            '^金价$': '/goldPrice',
            '^开服\\s([\\S\\s]*)$': '/serverStatus $1',
            '^开服$': '/serverStatus',

            '^(攻略|成就)\\s(\\S*)$': '/achievement $2',

            '^资历排行\\s?([\\S\\s]*)$': '/seniority $1',

            '^更新|游戏更新$': '/gameUpdate',
            '^日常|游戏日常$': '/daily',

            '^小药\\s(\\S*)$': '/reinforcement $1',

            '^阵眼\\s(\\S*)$': '/eye $1',

            '^(奇遇|查询)\\s([\\S\\s]*)$': '/serendipity $2',
            //'^(处刑|竞技场)\\s([\\S\\s]*)$': '/jjc $2',

            '^(沙盘|阵营沙盘)\\s(\\S*)$': '/sandbox $2',
            '^(沙盘|阵营沙盘)$': '/sandbox',

            '^器物谱\\s(\\S*)$': '/travel $1',
            '^家具\\s(\\S*)$': '/furniture $1',
            '^物价\\s(\\S+)$': '/price $1',

            '^物品\\s([\\S\\s]+)$': '/item $1',
            '^交易行\\s([\\S*\\s]+)$': '/item $1',

            '^群信息$': '/group info',
            '^群昵称\\s([\\S\\s]+)': '/group groupname $1',
            '^咕咕称呼\\s([\\S\\s]+)': '/group nickname $1',
            '^群服务器\\s([\\S\\s]+)': '/group server $1',
            '^(打开|关闭|开|关)\\s(奇遇播报|群内奇遇播报|开服播报|新闻播报|简便命令|智障对话|斗图)': '/group set $2 $1',

            '^权限列表$': '/permission list',
            '^权限设置\\s([\\S\\s]+)': '/permission set $1',

            '^(开团|创建团队)\\s?([\\S\\s]*)': '/team create $2',
            '^(删除团队)\\s?([\\S\s]*)': '/team delete $2',
            '^(团队列表)\\s?([\\S\\s]*)': '/team list $2',
            '^(查看团队)\\s?([\\S\\s]*)': '/team view $2',
            '^(取消报名)\\s?([\\S\\s]*)': '/team cancel $2',
            '^(团队报名)\\s?([\\S\\s]+)': '/team apply $2',

            '^添加记录\\s(\\S*)$': '/sign add $1',
            '^删除记录\\s(\\S*)$': '/sign delete $1',

            '^添加别名\\s([\\S\\s]+)': '/alias add $1',
            '^删除别名\\s([\\S\\s]+)': '/alias delete $1'
        };
        if(data.group_id && data.switchs.chat) {
            let nickname = await this.redis.get(`GroupNickname:${data.group_id}`);
            if(nickname == null) {
                const Group = require('./model/group');
                nickname = (await Group.findOne({where: {group_id: data.group_id}})).nickname;
                nickname = nickname ?? '咕咕';
                await this.redis.set(`GroupNickname:${data.group_id}`, nickname);
            }
            nickname = nickname.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            regex_map[`^(${nickname}说)\\s?([\\S\\s]+)$`] = '/talk $2';
            regex_map[`^(${nickname})\\s?([\\S\\s]+)$`] = '/chat $2';
        }else{
            regex_map[`^(咕咕说)\\s?([\\S\\s]+)$`] = '/talk $2';
            regex_map[`^(咕咕)\\s?([\\S\\s]+)$`] = '/chat $2';
        }

        let message = data.message.trim();
        for(let i in regex_map) {
            let regex = new RegExp(i);
            if(regex.test(message)) {
                data.message = message.replace(regex, regex_map[i]);
                return await this.handleCommand(data, cqhttp);
            }
        }
        return null;
    }
}

module.exports = Bot;
