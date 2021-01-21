const Alias = require('../model/alias');

module.exports = class AliasHandler{
    async handle(ctx) {
        let params = {
            action: args[0]            
        }
        if(params.action == 'add') {
            return this.add(args);
        } else if (params.action == 'rm') {
            return this.remove(args);
        }

        return text.replace(/[ ]{2,}/g,"");;
    }

    async add(args) {
        let params = {
            action: args[0],
            scope: args[1],
            real: args[2],
            alias: args[3],
        }

        let alias = await Alias.findOne({
            where: {
                real: params.real,
                alias: params.alias,
                scope: params.scope
            }
        });
        if(alias != null) {
            return 'ERROR: Alias already exists.\n错误：该别名已存在！';
        }
        alias = await Alias.create({
            real: params.real,
            alias: params.alias,
            scope: params.scope
        })
        return `别名已成功创建`;
    }

    async remove(args) {
        let params = {
            action: args[0],
            scope: args[1],
            alias: args[2],
        };

        let alias = await Alias.findOne({
            where: {
                alias: params.alias,
                scope: params.scope
            }
        });

        if (alias != null) {
            alias.destroy();
        }
    }

    static argsList() {
        return {
            action: {
                name: 'action',
                alias: 'team_action',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'action',
                limit: ['create', 'delete', 'apply', 'list', 'view', 'cancel', 'set'],
                nullable: true,
                default: 'list'
            },
            branch: {
                create: [
                    {
                        name: 'server',
                        alias: 'server',
                        type: 'string',
                        defaultIndex: 2,
                        shortArgs: null,
                        longArgs: 'server',
                        limit: null,
                        nullable: true,
                        default: '唯我独尊'
                    },{
                        name: 'map',
                        alias: 'map',
                        type: 'string',
                        defaultIndex: 3,
                        shortArgs: null,
                        longArgs: 'map',
                        limit: null,
                        nullable: true,
                        default: '广陵邑'
                    },{
                        name: 'update',
                        alias: null,
                        type: 'boolean',
                        defaultIndex: 4,
                        shortArgs: 'u',
                        longArgs: 'update',
                        limit: null,
                        nullable: true,
                        default: false
                    }
                ],
                delete : [
                    {
                        name: '87578',
                        alias: 'server',
                        type: 'string',
                        defaultIndex: 2,
                        shortArgs: null,
                        longArgs: 'server',
                        limit: null,
                        nullable: true,
                        default: '唯我独尊'
                    },{
                        name: '782872',
                        alias: 'map',
                        type: 'string',
                        defaultIndex: 3,
                        shortArgs: null,
                        longArgs: 'map',
                        limit: null,
                        nullable: true,
                        default: '广陵邑'
                    },{
                        name: '782872',
                        alias: null,
                        type: 'boolean',
                        defaultIndex: 4,
                        shortArgs: 'u',
                        longArgs: 'update',
                        limit: null,
                        nullable: true,
                        default: false
                    }
                ]
            }
        };
    }

    static helpText() {
        return `
        `.replace(/[ ]{2,}/g,"");
    }
}