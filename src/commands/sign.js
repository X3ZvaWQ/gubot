const Group = require("../model/group");

module.exports = class ReinforcementHandler {
    async handle(ctx) {
        if (ctx.data.message_type == 'private') throw '本命令仅限群内使用';
        let action = ctx.args.action;
        if (action == 'list') {
            throw '还没做好'
        } else if (action == 'add') {
            return await this.add(ctx);
        } else if (action == 'delete') {
            return await this.delete(ctx)
        }
    }

    async list(ctx) {
        let group_id = ctx.data.group_id;
        let group = await Group.findOne({
            where: {
                group_id: group_id
            }
        });
        if(group == null) {
            return `[${group_id}]监控列表：\n[空]`
        }
        return `[${group.groupname}]监控列表：\n${group.members}`
    }

    async add(ctx) {
        let args = ctx.args;
        let group_id = ctx.data.group_id;
        let group = await Group.findOne({
            where: {
                group_id: group_id
            }
        });
        if(group == null) {
            group = await Group.create({
                group_id: group_id,
                server: '唯我独尊',
                groupname: group_id
            })
        }
        let members = group.members ? group.members.split(',') : [];
        members.push(args.player);
        group.members = members.join(',');
        group.save();
        return `成功：群内奇遇监控已开始监控[${args.player}]`;
    }

    async delete(ctx) {
        let args = ctx.args;
        let group_id = ctx.data.group_id;
        let group = await Group.findOne({
            where: {
                group_id: group_id
            }
        });
        if(group == null) {
            throw `错误：当前群并没有监控过 ${args.player}`;
        }
        let members = group.members ? group.members.split(',') : [];
        let index = members.indexOf(args.player)
        if(index == -1) {
            throw `错误：当前群并没有监控过 ${args.player}`
        }
        members.splice(index, 1);
        group.members = members.join(',');
        group.save();
        return `成功：群内奇遇监控不再监控 [${args.player}]`;
    }

    static argsList() {
        return {
            action: {
                name: 'action',
                alias: 'alias_action',
                displayName: '别名-命令分支',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'action',
                limit: ['list', 'add', 'delete'],
                nullable: true,
                default: 'list'
            },
            branch: {
                list: [],
                add: [{
                    name: 'player',
                    alias: null,
                    displayName: '监控玩家',
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'player',
                    limit: {
                        min: 2,
                        max: 6
                    },
                    nullable: false,
                    default: null
                }],
                delete: [{
                    name: 'player',
                    alias: null,
                    displayName: '玩家',
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'player',
                    limit: {
                        min: 2,
                        max: 6
                    },
                    nullable: false,
                    default: null
                }]
            }
        };
    }
}
