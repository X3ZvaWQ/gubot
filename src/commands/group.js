const Group = require("../model/group");
const moment = require('moment');
const Alias = require("../model/alias");


module.exports = class GroupHandler {
    static demandPermission = true;

    async handle(ctx) {
        let args = ctx.args;
        let action = args.action;
        if (action == 'info') {
            return await this.info(ctx);
        } else if (action == 'server') {
            return await this.server(ctx);
        } else if (action == 'nickname') {
            return await this.nickname(ctx);
        } else if (action == 'groupname') {
            return await this.groupname(ctx);
        }else if (action == 'set') {
            return await this.set(ctx);
        }
    }

    async info(ctx) {
        if (ctx.data.message_type == 'group') {
            let group_id = ctx.data.group_id;
            let redis_key = `GroupInfo:${group_id}`;
            let result = await bot.redis.get(redis_key);
            if (result == null) {
                let group = await Group.findOne({
                    where: {
                        group_id: group_id
                    }
                });
                if (group == null) {
                    group = await Group.create({
                        group_id: group_id,
                        server: '唯我独尊',
                        groupname: group_id
                    });
                }
                result = `------咕Bot·本群配置------
                咕咕称呼:${group.nickname}
                群称呼：${group.groupname}
                群默认服务器：${group.server}
                便捷命令开关：${group.convenient}
                机器人入群时间：${moment(group.created_at).format('YYYY-MM-DD hh:mm:ss')}
                `
                await bot.redis.set(redis_key, result);
            }
            return result.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
        } else if (ctx.data.message_type == 'private') {
            throw '本命令仅限群内使用';
        }
    }

    async server(ctx) {
        let server = ctx.args.server;
        if (ctx.data.message_type == 'group') {
            if (server != null && server != undefined) {
                let permission = ctx.permission;
                if (permission < 4) {
                    throw '权限不足。'
                }
                let group_id = ctx.data.group_id;
                let group = await Group.findOne({
                    where: {
                        group_id: group_id
                    }
                });
                if (group == null) {
                    group = await Group.create({
                        group_id: group_id,
                        server: server,
                        nickname: group_id
                    });
                } else {
                    group.server = server;
                    group.save();
                }
                let redis_key = `GroupInfo:${group_id}`;
                await bot.redis.del(redis_key);
                return '本群默认服务器已被修改为：' + server;
            } else {
                return this.info(ctx);
            }
        } else if (ctx.data.message_type == 'private') {
            throw '本命令仅限群内使用';
        }
    }

    async nickname(ctx) {
        let nickname = ctx.args.nickname;
        if (ctx.data.message_type == 'group') {
            if (nickname != null && nickname != undefined) {
                let permission = ctx.permission;
                if (permission < 4) {
                    throw '权限不足。'
                }
                let group_id = ctx.data.group_id;
                let group = await Group.findOne({
                    where: {
                        group_id: group_id
                    }
                });
                if (group == null) {
                    group = await Group.create({
                        group_id: group_id,
                        server: '唯我独尊',
                        nickname: nickname,
                    });
                } else {
                    group.nickname = nickname;
                    group.save();
                }
                let redis_key = `GroupInfo:${group_id}`;
                await bot.redis.del(redis_key);
                redis_key = `GroupNickname:${group_id}`;
                await bot.redis.set(redis_key, nickname);
                return '本群咕咕的称呼已被修改为：' + nickname;
            } else {
                return this.info(ctx);
            }
        } else if (ctx.data.message_type == 'private') {
            throw '本命令仅限群内使用';
        }
    }

    async groupname(ctx) {
        let groupname = ctx.args.groupname;
        if (ctx.data.message_type == 'group') {
            if (groupname != null && groupname != undefined) {
                let permission = ctx.permission;
                if (permission < 4) {
                    throw '权限不足。'
                }
                let group_id = ctx.data.group_id;
                let group = await Group.findOne({
                    where: {
                        group_id: group_id
                    }
                });
                if (group == null) {
                    group = await Group.create({
                        group_id: group_id,
                        server: '唯我独尊',
                        nickname: '咕咕',
                        groupname: groupname
                    });
                } else {
                    group.groupname = groupname;
                    group.save();
                }
                let redis_key = `GroupInfo:${group_id}`;
                await bot.redis.del(redis_key);
                return '本群称呼已被修改为：' + groupname;
            } else {
                return this.info(ctx);
            }
        } else if (ctx.data.message_type == 'private') {
            throw '本命令仅限群内使用';
        }
    }

    async set(ctx){
        let args = ctx.args;
        if (ctx.data.message_type == 'group') {
            if (args.switch != null && args.switch != undefined) {
                let permission = ctx.permission;
                if (permission < 4) {
                    throw '权限不足。'
                }
                let group_id = ctx.data.group_id;
                let func = Alias.get(args.function, 'function', group_id);
                let swi = args.switch == 'true';
                let whilelist = ['convenient', 'chat', 'server_broadcast', 'serendipity_broadcast', 'meme'];
                if(whilelist.indexOf(func) == -1) {
                    throw `错误：功能 ${args.function} 不存在`;
                }
                let group = await Group.findOne({
                    where: {
                        group_id: group_id
                    }
                });
                if (group == null) {
                    group = await Group.create({
                        group_id: group_id,
                        server: '唯我独尊',
                        nickname: '咕咕',
                        groupname: group_id
                    });
                }
                group[func] = swi;
                group.save();
                let redis_key = `GroupFunc:${func}:${group_id}`;
                await bot.redis.set(redis_key, swi=='true'? true : false);
                redis_key = `GroupInfo:${group_id}`;
                await bot.redis.del(redis_key);
                return `本群${func}功能开关已被修改为：${swi}`;
            } else {
                return this.info(ctx);
            }
        } else if (ctx.data.message_type == 'private') {
            throw '本命令仅限群内使用';
        }
    }

    static argsList() {
        return {
            action: {
                name: 'action',
                alias: 'group_action',
                displayName: '群组-命令分支',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'action',
                limit: ['server', 'info', 'nickname', 'groupname' ,'set'],
                nullable: true,
                default: 'info'
            },
            branch: {
                info: [],
                server: [{
                    name: 'server',
                    alias: 'server',
                    displayName: '服务器',
                    type: 'server',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'server',
                    limit: null,
                    nullable: true,
                    default: null
                }],
                nickname: [{
                    name: 'nickname',
                    alias: null,
                    displayName: '机器人称呼',
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'nickname',
                    limit: {min: 2, max: 8},
                    nullable: true,
                    default: null
                }],
                groupname: [{
                    name: 'groupname',
                    alias: null,
                    displayName: '群称呼',
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'groupname',
                    limit: {min: 2, max: 8},
                    nullable: true,
                    default: null
                }],
                set: [{
                    name: 'function',
                    alias: 'function',
                    displayName: '功能名称',
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'function',
                    limit: null,
                    nullable: false,
                    default: null
                }, {
                    name: 'switch',
                    alias: 'boolean',
                    displayName: '开关',
                    type: 'boolean',
                    defaultIndex: 3,
                    shortArgs: null,
                    longArgs: 'switch',
                    limit: null,
                    nullable: true,
                    default: true
                }],
            }
        };
    }
}
