const Group = require("../model/group");
const User = require("../model/user");
const Cq = require("../service/cqhttp");

module.exports = class PermissionHandler {
    static demandPermission = true;

    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let action = args.action;
        if (action == 'list') {
            return await this.list(ctx);
        } else if (action == 'set') {
            return await this.set(ctx);
        }
    }

    async list(ctx) {
        if (ctx.permissions < 2) {
            throw '权限不足。'
        }
        if (ctx.data.message_type == 'group') {
            let group_id = ctx.data.group_id;
            let redis_key = `GroupPermissionList:${group_id}`;
            let result = await redis.get(redis_key);
            if (result == null) {
                let user_id = ctx.data.sender.user_id;
                let group = await Group.findOne({
                    where: {
                        group_id: group_id
                    }
                });
                let users = await User.findAll({
                    where: {
                        qq: user_id,
                        group: group_id
                    }
                });
                const n2r = {
                    1: 'member',
                    2: 'admin',
                    4: 'owner'
                }
                let display = [];
                for (let i in users) {
                    let user = users[i];
                    display.push(`${user.nickname}(${user.qq}) - ${n2r[user.permissions]}`);
                }
                result = `------群${group.nickname || group.group_id || ctx.data.group_id}·权限列表------
                ${display.join('\n')}
                `
                await redis.set(redis_key, result);
            }
            return result.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");;
        } else if (ctx.data.message_type == 'private') {
            let user_id = ctx.data.sender.user_id;
            let redis_key = `GlobalPermissionList`;
            let result = await redis.get(redis_key);
            if (result == null) {
                let users = await User.findAll({
                    where: {
                        qq: user_id,
                        group: '*'
                    }
                });
                const n2r = {
                    1: 'member',
                    2: 'admin',
                    4: 'owner'
                }
                let display = [];
                for (let i in users) {
                    let user = users[i];
                    display.push(`${user.nickname}(${user.qq}) - ${n2r[user.permissions]}`);
                }
                result = `------机器人全局权限列表------
                ${display.join('\n')}
                `;
                await redis.set(redis_key, result);
            }
            return result.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");;
        }
    }

    async set(ctx) {
        if (ctx.permissions < 4) {
            throw '权限不足。'
        }
        let args = ctx.args;
        let targetQQ = Cq.AtCQCodeParse(args.user);
        let level = args.level;
        if (ctx.data.message_type == 'group') {
            let group_id = ctx.data.group_id;
            let user = await User.findOne({
                where: {
                    qq: targetQQ,
                    group: group_id
                }
            });
            if (user == null) {
                user = await User.create({
                    qq: targetQQ,
                    group: group_id,
                    nickname: targetQQ,
                    permissions: level
                });
            } else {
                user.permissions = level;
                user.save();
            }
            let redis_key = `GroupPermissionList:${group_id}`;
            await redis.del(redis_key);
            return '权限修改成功';
        } else if (ctx.data.message_type == 'private') {
            let target_id = args.user;
            let redis_key = `GlobalPermissionList`;
            let users = await User.findAll({
                where: {
                    qq: target_id,
                    group: '*'
                }
            });
            if (user == null) {
                user = await User.create({
                    qq: target_id,
                    group: '*',
                    nickname: target_id,
                    permissions: level
                });
            } else {
                user.permissions = level;
                user.save();
            }
            await redis.del(redis_key);
            return '权限修改成功';
        }
    }

    static argsList() {
        return {
            action: {
                name: 'action',
                alias: 'permission_action',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'action',
                limit: ['list', 'set'],
                nullable: true,
                default: 'list'
            },
            branch: {
                set: [{
                    name: 'user',
                    alias: null,
                    type: 'CQ',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'user',
                    limit: null,
                    nullable: false,
                    default: null
                }, {
                    name: 'level',
                    alias: 'role',
                    type: 'string',
                    defaultIndex: 3,
                    shortArgs: null,
                    longArgs: 'map',
                    limit: ['1', '2', '4'],
                    nullable: true,
                    default: '1'
                }],
                list: []
            }
        };
    }
}