const CqHttp = require('../../service/cqhttp');
const Team = require('../../model/team');
const allxf = require('../../assets/json/xf.json');
const allxfid = require('../../assets/json/xfid.json');
module.exports = class TeamCalcelHandler {
    name = "TeamCancel";

    args = [
        {
            name: 'game_id',
            alias: 'xf',
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
            data.message.startsWith('取消报名')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let group = event.group;
        let user = event.user;
        let xfid = allxf[args.game_id] ? allxf[args.game_id].id : null;

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
            throw '错误：该团队不存在，请使用 团队列表 查看本群团队';
        }

        let cells = JSON.parse(team.data);
        let cell = cells.filter((x) => (x.applied && x.applicant.qq == user.qq));
        if (cell.length < 1) {
            throw `错误：你没有报名id为 ${team.id} 的团队。`;
        } else if (cell.length > 1 && args.game_id == '-') {
            throw `错误：该团队有多个你的报名，请指定要取消的id。`;
        }

        let cancelled_cell = { count: 0 };

        if (cell.length > 1) {
            cell = cell.filter((c) => (c.applicant.id == args.game_id || c.xf == xfid));
        }
        if (cell.length > 0) {
            for (let i in cell) {
                let id = `[${cell[i].applicant.id}]`;
                let xf = allxfid[`${cell[i].xf}`] || cell[i].xf;
                if (cancelled_cell[xf]) {
                    cancelled_cell[xf].push(id);
                } else {
                    cancelled_cell[xf] = [id]
                }
                cancelled_cell.count++;

                cell[i].xf = null;
                cell[i].applied = false;
                cell[i].applicant = {
                    qq: null,
                    id: null
                }
                cells[cell[i].id - 1] = cell[i];
                //取消坑位之后从后面找人替代
                for(let j = cell[i].id; j < cells.length; j++) {
                    if(cell[i].xf_optional.indexOf(cells[j].xf) != -1) {
                        cell[i].xf = cells[j].xf;
                        cell[i].applied = true;
                        cell[i].applicant = {
                            qq: cells[j].applicant.qq,
                            id: cells[j].applicant.id
                        };
                        
                        cells[j].xf = null;
                        cells[j].applied = false;
                        cells[j].applicant = {
                            qq: null,
                            id: null
                        }
                        break;
                    }
                }
            }
        } else {
            throw `错误：你并没有报名游戏id或心法为 ${args.game_id} 的角色`;
        }

        let text = ``;
        for (let xf in cancelled_cell) {
            if (xf != 'count') {
                text += `ID为${cancelled_cell[xf].join('、')}的[${xf}]`
            }
        }
        team.data = JSON.stringify(cells);
        await team.save();
        return CqHttp.sendGroupMessage(`取消了${text}共${cancelled_cell.count}个报名，可以使用 查看团队 查看当前团队`, group.group_id);
    }
}
