const Alias = require('../model/alias');
const { Op } = require("sequelize");
const Cq = require('../service/cqhttp');
const Image = require('../service/image');

module.exports = class AliasHandler {
    async handle(ctx) {
        let action = ctx.args.action;
        if (action == 'list') {
            return '性能原因，暂时禁止使用' //this.list(ctx);
        } else if (action == 'add') {
            return await this.add(ctx);
        } else if (action == 'delete') {
            return await this.delete(ctx)
        }
    }

    async add(ctx) {
        let args = ctx.args;
        if(args.permission < 2) {
            return '权限不足。需要admin及以上权限';
        }
        if(args.alias == args.real) {
            return '错误：禁止套娃！'
        }
        let where = {
            real: args.real,
            alias: args.alias,
            scope: args.scope,
            group: '*'
        };
        if(ctx.data.message_type == 'group'){
            let group_id = ctx.data.group_id;
            where['group'] = group_id;
        }
        let alias = await Alias.findOne({
            where: where
        });
        if (alias != null) {
            return 'ERROR: Alias already exists.\n错误：该别名已存在！';
        }
        alias = await Alias.create(where)
        let result = `别名已成功创建,现在 ${where.scope} 的 ${where.alias} 会被认为是 ${where.real}`;
        delete where.real;
        await redis.del('Alias:'+JSON.stringify(where));
        return result;
    }

    async delete(ctx) {
        let args = ctx.args;
        if(args.permission < 2) {
            return '权限不足。需要admin及以上权限';
        }
        let where = {
            real: args.real,
            alias: args.alias,
            scope: args.scope,
            group: '*'
        };
        if(ctx.data.message_type == 'group'){
            let group_id = ctx.data.group_id;
            where['group'] = group_id;
        }
        let alias = await Alias.findOne({
            where: where
        });
        if (alias != null) {
            alias.destroy();
            let result = `成功,${where.scope} 下 ${where.real} 的别名 ${where.alias} 已删除`;
            delete where.real;
            await redis.del('Alias:'+JSON.stringify(where));
            return result;
        }else{
            return '该别名不存在';
        }
    }

    async list(ctx) {
        let args = ctx.args;
        let where = {
            real: args.real,
            alias: args.alias,
            scope: args.scope,
            group: ctx.data.message_type == 'group' ? {
                [Op.or]: ['*', ctx.data.group_id]
            } : '*'
        };
        for(let k in where){
            if(where[k] == null) delete where[k];
        }
        let redis_key = `AliasList:${JSON.stringify(where)}`;
        let result = await redis.get(redis_key);
        if(result == null) {
            let alias_all = await Alias.findAll({where:where, logging: console.log});
            let array = [
                ['作用域', '别名', '指向']
            ];
            for(let i in alias_all) {
                let alias = alias_all[i];
                array.push([alias.scope, alias.alias, alias.real]);
            }
            result = `------查询的别名列表------
            ${Cq.ImageCQCode('file://' + await Image.generateFromArrayTable(array))}
            `.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 86400);
        }
        return result;
    }

    static argsList() {
        return {
            action: {
                name: 'action',
                alias: 'alias_action',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'action',
                limit: ['list', 'add', 'delete'],
                nullable: true,
                default: 'list'
            },
            branch: {
                list: [{
                    name: 'real',
                    alias: null,
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'real',
                    limit: null,
                    nullable: true,
                    default: null
                }, {
                    name: 'alias',
                    alias: null,
                    type: 'string',
                    defaultIndex: 3,
                    shortArgs: null,
                    longArgs: 'alias',
                    limit: null,
                    nullable: true,
                    default: null
                }, {
                    name: 'scope',
                    alias: null,
                    type: 'string',
                    defaultIndex: 4,
                    shortArgs: null,
                    longArgs: 'scope',
                    limit: null,
                    nullable: true,
                    default: null
                }],
                delete: [{
                    name: 'real',
                    alias: null,
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'real',
                    limit: null,
                    nullable: false,
                    default: null
                }, {
                    name: 'alias',
                    alias: null,
                    type: 'string',
                    defaultIndex: 3,
                    shortArgs: null,
                    longArgs: 'alias',
                    limit: null,
                    nullable: false,
                    default: null
                }, {
                    name: 'scope',
                    alias: null,
                    type: 'string',
                    defaultIndex: 4,
                    shortArgs: null,
                    longArgs: 'scope',
                    limit: null,
                    nullable: false,
                    default: null
                }],
                add: [{
                    name: 'real',
                    alias: null,
                    type: 'string',
                    defaultIndex: 2,
                    shortArgs: null,
                    longArgs: 'real',
                    limit: null,
                    nullable: false,
                    default: null
                }, {
                    name: 'alias',
                    alias: null,
                    type: 'boolean',
                    defaultIndex: 3,
                    shortArgs: null,
                    longArgs: 'alias',
                    limit: null,
                    nullable: true,
                    default: false
                }, {
                    name: 'scope',
                    alias: null,
                    type: 'string',
                    defaultIndex: 4,
                    shortArgs: null,
                    longArgs: 'scope',
                    limit: null,
                    nullable: false,
                    default: null
                }, ],
            }
        };
    }
}