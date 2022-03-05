const CqHttp = require('../../service/cqhttp');
const Team = require('../../model/team');

module.exports = class TeamCreateHandler {
    name = "TeamCreate";

    args = [
        {
            name: 'name',
            alias: null,
            displayName: '团队名',
            type: 'string',
            limit: null,
            nullable: false,
            default: null
        }, {
            name: 'time',
            alias: null,
            displayName: '开团时间',
            type: 'string',
            limit: null,
            nullable: false,
            default: null
        }, {
            name: 'squad',
            alias: null,
            displayName: '阵容预设',
            type: 'string',
            limit: null,
            nullable: true,
            default: '2T4H19D'
        }, {
            name: 'remark',
            alias: null,
            displayName: '团队备注',
            type: 'string',
            limit: null,
            nullable: true,
            default: ''
        }
    ];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message_type == 'group' &&
            data.message.startsWith('创建团队 ')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let group = event.group;
        let user = event.user;
        if (user.power < 4096) {
            throw `错误：权限不足，需要权限${4096}，你的权限${user.power}。`
        }
        let emptyData;
        try {
            emptyData = await Team.generateEmptyData(args.squad, group.group_id);
        } catch (e) {
            throw e;
        }
        let team = await Team.create({
            group_id: group.id,
            name: args.name,
            squad: args.squad,
            data: JSON.stringify(emptyData),
            time: args.time,
            remarks: args.remark
        })
        return CqHttp.sendGroupMessage(`成功：团队创建完毕,id为${team.id}，可以通过 查看团队 进行查看`, group.group_id)
    }
}
