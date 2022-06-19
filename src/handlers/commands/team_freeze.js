const CqHttp = require('../../service/cqhttp');
const Team = require('../../model/team');

module.exports = class TeamFreezeHandler {
    name = "TeamFreeze";

    args = [
        {
            name: 'team_id',
            alias: null,
            displayName: '团队id',
            type: 'integer',
            limit: null,
            nullable: true,
            default: '-'
        }
    ];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message_type == 'group' &&
            data.message.startsWith('冻结团队')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let group = event.group;
        let user = event.user;
        if (user.power < 4096) {
            throw `错误：权限不足，需要权限${4096}，你的权限${user.power}。`
        }
        let team;
        if (args.team_id == '-') {
            team = await group.getTeams();
            if (team.length > 1) {
                throw '错误：本群存在多个团队，请在第三个参数指定团队id'
            }
            team = team[0];
        } else {
            team = await Team.findOne({
                where: {
                    id: args.team_id,
                    group_id: group.id
                }
            });
        }
        if (team == null) {
            throw '错误：该团队不存在，请使用 团队列表 查看本群团队';
        }
        let [id, name] = [team.id, team.name];
        team.freeze = true;
        await team.save();
        return CqHttp.sendGroupMessage(`成功：id为${id},名称为${name}的团队已停止报名`, group.group_id);
    }
}
