const CqHttp = require('../../service/cqhttp');
const Team = require('../../model/team');
const allxf = require('../../assets/json/xf.json');

module.exports = class TeamCalcelHandler {
    name = "TeamCancel";

    args = [
        {
            name: 'game_id',
            alias: null,
            displayName: '游戏ID',
            type: 'string',
            limit: null,
            nullable: true,
            default: '-'
        },
        {
            name: 'team_id',
            alias: null,
            displayName: '团队ID',
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
            data.message.startsWith('取消报名 ')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let group = event.group;
        let user = event.user;
        let team;
        if (args.team_id == '-') {
            team = await group.getTeams();
            if (team.length > 1) {
                throw '错误：本群存在多个团队，请指定团队id'
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
            throw '错误：该团队不存在，请使用/team list查看本群团队';
        }
        let cells = JSON.parse(team.data);
        let cell = cells.filter((x) => (x.applied && x.applicant.qq == user.qq));
        if (cell.length < 1) {
            throw `错误：你没有报名id为 ${team.id} 的团队。`;
        } else if(cell.length > 1 && args.game_id == '-'){
            throw `错误：id为 ${team.id} 的团队内有多个你的报名，请指定要取消的id。`;   
        }
        if (cell.length < 1) {
            for (let i in cell) {
                cell[i].xf = null;
                cell[i].applied = false,
                    cell[i].applicant = {
                        qq: null,
                        id: null
                    }
                cells[cell[i].id - 1] = cell[i];
            }
        } else {
            cell = cell.filter((c) => { return c.applicant.id == args.game_id });
            if (cell.length > 0) {
                for (let i in cell) {
                    cell[i].xf = null;
                    cell[i].applied = false,
                        cell[i].applicant = {
                            qq: null,
                            id: null
                        }
                    cells[cell[i].id - 1] = cell[i];
                }
            } else {
                throw `错误：你并没有报名游戏id为 ${args.game_id} 的角色`;
            }
        }
        team.data = JSON.stringify(cells);
        await team.save();
        return CqHttp.sendGroupMessage(`取消报名成功，可以使用 查看团队 查看当前团队`, group.id);
    }
}
