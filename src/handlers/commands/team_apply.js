const CqHttp = require('../../service/cqhttp');
const Team = require('../../model/team');
const allxf = require('../../assets/json/xf.json');

module.exports = class TeamApplyHandler {
    name = "TeamApply";

    args = [
        {
            name: 'xf',
            alias: 'xf',
            displayName: '心法',
            type: 'string',
            limit: null,
            nullable: false,
            default: null
        },
        {
            name: 'game_id',
            alias: null,
            displayName: '角色ID',
            type: 'string',
            limit: {
                min: 1,
                max: 6
            },
            nullable: false,
            default: null
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
            (data.message.startsWith('团队报名 ') || data.message.startsWith('报名 '))
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let group = event.group;
        let user = event.user;
        let _xf = args.xf;
        let xf = allxf[_xf];
        if (xf == undefined) {
            throw `错误：未知的心法 ${_xf} !`;
        }
        xf = xf.id;
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
        let cells = JSON.parse(team.data);
        let cells_valid = cells.filter((x) => (x.xf_optional.indexOf(xf) != -1 && !x.applied));
        if (cells_valid.length < 1) {
            throw `错误：id为 ${args.team_id} 的团队没有 ${xf} 的坑位。`;
        }
        let success = false;
        for (let i in cells_valid) {
            let cell = cells_valid[i];
            if (cell.uxid != -1) {
                const checkUxid = (samexfidcells, xf) => {
                    if (xf == 0) return false;
                    for (let i in samexfidcells) {
                        let cell = samexfidcells[i];
                        if (cell.xf == xf && cell.applied) {
                            return true;
                        }
                    }
                }
                let samexfidcells = cells.filter((x) => x.uxid == cell.uxid);
                if (checkUxid(samexfidcells, xf)) {
                    continue;
                } else {
                    cell.xf = xf;
                    cell.applied = true;
                    cell.applicant = {
                        qq: user.qq,
                        id: args.game_id
                    };
                    success = true;
                    break;
                }
            } else {
                cell.xf = xf;
                cell.applied = true;
                cell.applicant = {
                    qq: user.qq,
                    id: args.game_id
                }
                success = true;
                break;
            }
        }
        if (success) {
            team.data = JSON.stringify(cells);
            await team.save();
            return CqHttp.sendGroupMessage(`报名成功，可以使用 查看团队 查看当前团队`, group.group_id);
        } else {
            throw `报名失败，请检查团队对应坑位是否充足`;
        }
    }
}
