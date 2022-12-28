const CqHttp = require('../../service/cqhttp');
const Team = require('../../model/team');
const allxf = require('@jx3box/jx3box-data/data/xf/xf.json');
const allxfid = require('@jx3box/jx3box-data/data/xf/xfid.json');
const allschool = require('@jx3box/jx3box-data/data/xf/school.json')

module.exports = class TeamViewHandler {
    name = "TeamView";

    args = [
        {
            name: 'team_id',
            alias: null,
            displayName: '团队id',
            type: 'integer',
            defaultIndex: 2,
            longArgs: 'team_id',
            limit: null,
            nullable: true,
            default: '-'
        }
    ];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message_type == 'group' &&
            data.message.startsWith('查看团队')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let group = event.group;
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
        for (let i in cells) {
            if (cells[i].xf != null) {
                let xf = cells[i].xf;
                xf = allxfid[`${xf}`];
                cells[i].color = allschool.color[allxf[xf]['school']];
            }
        }
        let image = await bot.imageGenerator.generateFromTemplateFile('team', {
            team_id: team.id,
            team_name: team.name,
            time: team.time,
            remarks: team.remarks,
            cells: cells,
        });
        return CqHttp.sendGroupMessage(CqHttp.CQ_image(image), group.group_id);
    }
}
