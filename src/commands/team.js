module.exports = class TeamHandler {
    static demandPermission = true;

    async handle(ctx) {
        //get args from state
        let args = ctx.args;

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
                    }, {
                        name: 'map',
                        alias: 'map',
                        type: 'string',
                        defaultIndex: 3,
                        shortArgs: null,
                        longArgs: 'map',
                        limit: null,
                        nullable: true,
                        default: '广陵邑'
                    }, {
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
                delete: [
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
                    }, {
                        name: '782872',
                        alias: 'map',
                        type: 'string',
                        defaultIndex: 3,
                        shortArgs: null,
                        longArgs: 'map',
                        limit: null,
                        nullable: true,
                        default: '广陵邑'
                    }, {
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

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `花价查询命令，可用命令有flower、花价、hj以及群管理员自定义的别名。可接受0~3个参数
            1.花的种类(--flower)，可为空，默认为绣球花
            2.服务器(--server)，可为空，默认为唯我独尊
            3.地图(--map)，可为空，默认为广陵邑
            4.更新(-u,--update)，可为空，默认不更新(5分钟刷新一次数据)

        `.replace(/[ ]{2,}/g, "");
    }
}