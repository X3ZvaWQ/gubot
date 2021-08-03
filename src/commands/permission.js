const Group = require("../model/group");
const User = require("../model/user");

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
        let permission = ctx.permission;
        if (permission < 2) {
            throw `错误：权限不足，需要权限${2}，你的权限${permission}。`
        }
        const n2r = {
            1: 'member',
            2: 'admin',
            4: 'owner'
        }
        if (ctx.data.message_type == 'group') {
            let group_id = ctx.data.group_id;
            let group = await Group.findOne({
                where: {
                    group_id: group_id
                }
            });
            let users = await User.findAll({
                where: {
                    group: group_id
                }
            });
            let data = {
                groupName: group.nickname || group.group_id || ctx.data.group_id,
                numbers: []
            }
            for (let i in users) {
                let user = users[i];
                data.numbers.push({
                    permission: n2r[user.permissions],
                    qq: user.qq,
                    nickname: user.nickname
                });
            }
            return `[CQ:image,file=file://${await bot.imageGenerator.generateFromTemplateFile('permissionList', data)}]`;
        } else if (ctx.data.message_type == 'private') {
            let users = await User.findAll({
                where: {
                    group: '*'
                }
            });
            let data = {
                groupName: '全局',
                numbers: []
            }
            for (let i in users) {
                let user = users[i];
                data.numbers.push({
                    permission: n2r[user.permissions],
                    qq: user.qq,
                    nickname: user.nickname
                });
            }
            return `[CQ:image,file=file://${await bot.imageGenerator.generateFromTemplateFile('permissionList', data)}]`;
        }
    }

    async set(ctx) {
        let permission = ctx.permission;
        if (permission < 2) {
            throw `错误：权限不足，需要权限${2}，你的权限${permission}。`
        }
        let args = ctx.args;
        let [_, targetQQ] = /qq=(\d+)/.exec(args.user);
        let level = args.level;
        if (ctx.data.message_type == 'group') {
            if(targetQQ == ctx.data.user_id) {
                throw `错误：不可以修改自己的权限`
            }
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
            return `成功：权限修改成功，${targetQQ}的权限现在为${level}`;
        } else if (ctx.data.message_type == 'private') {
            let target_id = args.user;
            let user = await User.findAll({
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
            return `成功：权限修改成功，${targetQQ}的权限现在为${level}`;
        }
    }

    static argsList() {
        return {
            action: {
                name: 'action',
                alias: 'permission_action',
                displayName: '权限-分支命令',
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
                    displayName: '@群内用户',
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
                    displayName: '权限等级',
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
