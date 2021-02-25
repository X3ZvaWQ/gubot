const Team = require('../model/team');
const Group = require('../model/group');
const allxf = require('@jx3box/jx3box-data/data/xf/xf.json');
const allxfid = require('@jx3box/jx3box-data/data/xf/xfid.json');
const allschool = require('@jx3box/jx3box-data/data/xf//school.json')
const Image = require('../service/image');
const Cq = require('../service/cqhttp');

module.exports = class TeamHandler {
    static demandPermission = true;

    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let action = ctx.args.action;
        if (action == 'list') {
            return await this.list(ctx);
        } else if (action == 'create') {
            return await this.create(ctx);
        } else if (action == 'delete') {
            return await this.delete(ctx);
        } else if (action == 'apply') {
            return await this.apply(ctx);
        } else if (action == 'cancel') {
            return await this.cancel(ctx);
        } else if (action == 'view') {
            return await this.view(ctx);
        }
    }

    async create(ctx){
        let args = ctx.args;
        let permission = ctx.permission;
        if(permission < 2) return '权限不足';
        if(!ctx.data.group_id) return '该命令仅限群内使用';
        let emptyData;
        try{
            emptyData = await Team.generateEmptyData(args.squad, ctx.data.group_id);
        }catch(e) {
            throw e;
        }
        let team = await Team.create({
            group_id: ctx.data.group_id,
            name: args.name,
            squad: ctx.squad,
            data: JSON.stringify(emptyData),
            time: args.time,
            remarks: args.remark
        })
        return `成功：团队创建完毕,id为${team.id}，可以通过/team view id/name查看团队`;
    }

    async delete(ctx){
        let args = ctx.args;
        let permission = ctx.permission;
        if(permission < 2) return '权限不足';
        if(!ctx.data.group_id) return '该命令仅限群内使用';
        let team;
        if(args.team_id == '-') {
            team = await Team.findAll({
                where: {
                    group_id: ctx.data.group_id
                }
            });
            if(team.length > 1) {
                return '错误：本群存在多个团队，请指定团队id'
            }
            team = team[0];
        }else{
            team = await Team.findOne({
                where: {
                    id: args.team_id,
                    group_id: ctx.data.group_id
                }
            });
        }
        if(team == null) {
            return '错误：该团队不存在，请使用/team list查看本群团队';
        }
        let [id, name] = [team.id, team.name];
        await team.destroy();
        return `成功：id为${id},名称为${name}的团队已成功删除`;
    }

    async list(ctx){
        if(!ctx.data.group_id) return '该命令仅限群内使用';
        let group_id = ctx.data.group_id;
        let group = await Group.findOne({
            where: {
                group_id: group_id
            }
        })
        let teams = await Team.findAll({
            where: {
                group_id: group_id
            }
        });
        let texts = [];
        for(let i in teams) {
            let team = teams[i];
            texts.push(`${team.id}: ${team.name} - ${team.time}`);
        }
        return `---${group.nickname}·团队列表---
        ${texts.join('\n')}`.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
    }

    async apply(ctx){
        let args = ctx.args;
        if(!ctx.data.group_id) return '该命令仅限群内使用';
        let group_id = ctx.data.group_id;
        let team_id = args.team_id;
        let _xf = args.xf;
        xf = allxf[_xf];
        if(xf == undefined){
            return `错误：未知的心法 ${_xf} !`;
        }
        xf = xf.id;
        let team;
        if(args.team_id == '-') {
            team = await Team.findAll({
                where: {
                    group_id: group_id
                }
            });
            if(team.length > 1) {
                return '错误：本群存在多个团队，请指定团队id'
            }
            team = team[0];
        }else{
            team = await Team.findOne({
                where: {
                    id: args.team_id,
                    group_id: group_id
                }
            });
        }
        if(team == null) {
            return `错误：本群不存在id为${team_id}的团队。`;
        }
        let cells = JSON.parse(team.data);
        let cells_valid = cells.filter((x) => (x.xf_optional.indexOf(xf) != -1 && !x.applied));
        if(cells_valid.length < 1) {
            return `错误：id为 ${team_id} 的团队没有 ${xf} 的坑位。`;
        }
        let success = false;
        for(let i in cells_valid) {
            let cell = cells_valid[i];
            if(cell.uxid != -1){
                const checkUxid = (samexfidcells, xf) => {
                    if(xf == 0) return false;
                    for(let i in samexfidcells) {
                        let cell = samexfidcells[i];
                        if(cell.xf == xf && cell.applied) {
                            return true;    
                        }
                    }
                }
                let samexfidcells = cells.filter((x) => x.uxid == cell.uxid);
                if(checkUxid(samexfidcells, xf)){
                    continue;
                }else{
                    cell.xf = xf;
                    cell.applied = true;
                    cell.applicant = {
                        qq: ctx.data.sender.user_id,
                        id: args.game_id
                    };
                    success = true;
                    break;
                }
            }else{
                cell.xf = xf;
                cell.applied = true;
                cell.applicant = {
                    qq: ctx.data.sender.user_id,
                    id: args.game_id
                }
                success = true;
                break;
            }
        }
        if(success) {
            team.data = JSON.stringify(cells);
            await team.save();
            return `报名成功，可以使用/team view id/name 查看团队`;
        }else{
            return `报名失败，请检查团队对应坑位是否充足`;
        }
    }

    async cancel(ctx){
        let args = ctx.args;
        if(!ctx.data.group_id) return '该命令仅限群内使用';
        let group_id = ctx.data.group_id;
        let team_id = args.team_id;
        let team;
        if(args.team_id == '-') {
            team = await Team.findAll({
                where: {
                    group_id: group_id
                }
            });
            if(team.length > 1) {
                return '错误：本群存在多个团队，请指定团队id'
            }
            team = team[0];
        }else{
            team = await Team.findOne({
                where: {
                    id: args.team_id,
                    group_id: group_id
                }
            });
        }
        if(team == null) {
            return `错误：本群不存在id为${team_id}的团队。`;
        }
        let cells = JSON.parse(team.data);
        let cell = cells.filter((x) => (x.applied && x.applicant.qq == ctx.data.sender.user_id));
        if(cell.length < 1) {
            return `错误：你没有报名id为 ${team_id} 的团队。`;
        }
        if(args.game_id == '-') {
            for(let i in cell) {
                cell[i].xf = null;
                cell[i].applied = false,
                cell[i].applicant = {
                    qq: null,
                    id: null
                }
                cells[cell[i].id] = cell[i];
            }
        }else{
            cell = cell.filter((c) => {return c.applicant.id == args.game_id});
            if(cell.length > 0) {
                cell = cell[0];
                cell.xf = null;
                cell.applied = false,
                cell.applicant = {
                    qq: null,
                    id: null
                }
                cells[cell.id] = cell;
            }else{
                return `错误：你并没有报名游戏id为 ${args.game_id} 的角色`;
            }
        }
        team.data = JSON.stringify(cells);
        await team.save();
        return `取消报名成功，可以使用/team view id/name 查看团队`;
    }

    async view(ctx) {
        let args = ctx.args;
        if(!ctx.data.group_id) return '该命令仅限群内使用';
        let group_id = ctx.data.group_id;
        let team;
        if(args.team_id == '-') {
            team = await Team.findAll({
                where: {

                    group_id: group_id
                }
            });
            if(team.length > 1) {
                return '错误：本群存在多个团队，请指定团队id'
            }
            team = team[0];
        }else{
            team = await Team.findOne({
                where: {
                    id: args.team_id,
                    group_id: group_id
                }
            });
        }
        if(team == null) {
            return '错误：该团队不存在，请使用/team list查看本群团队';
        }
        let cells = JSON.parse(team.data);
        for(let i in cells) {
            if(cells[i].xf != null) {
                let xf = cells[i].xf;
                xf = allxfid[`${xf}`];
                cells[i].color = allschool.color[allxf[xf]['school']];
            }
        }
        let image = await Image.generateFromTemplateFile('team', {
            team_id: team.id,
            team_name: team.name,
            time: team.time,
            remarks: team.remarks,
            cells: cells,
        });
        return `${Cq.ImageCQCode('file://'+image)}`;
    }

    static argsList(ctx) {
        return {
            action: {
                name: 'action',
                alias: 'team_action',
                type: 'string',
                defaultIndex: 1,
                longArgs: 'action',
                limit: ['create', 'delete', 'list', 'view', 'apply', 'cancel'/* , 'set', 'subscribe' */],
                nullable: true,
                default: 'list'
            },
            branch: {
                create: [
                    {
                        name: 'name',
                        alias: null,
                        type: 'string',
                        defaultIndex: 2,
                        longArgs: 'name',
                        limit: null,
                        nullable: false,
                        default: null
                    }, {
                        name: 'time',
                        alias: null,
                        type: 'string',
                        defaultIndex: 3,
                        longArgs: 'time',
                        limit: null,
                        nullable: false,
                        default: null
                    }, {
                        name: 'squad',
                        alias: null,
                        type: 'string',
                        defaultIndex: 4,
                        longArgs: 'squad',
                        limit: null,
                        nullable: true,
                        default: '2T4H19D'
                    }, {
                        name: 'remark',
                        alias: null,
                        type: 'string',
                        defaultIndex: 5,
                        longArgs: 'remark',
                        limit: null,
                        nullable: true,
                        default: false
                    }
                ],
                delete: [
                    {
                        name: 'team_id',
                        alias: 'server',
                        type: 'integer',
                        defaultIndex: 2,
                        longArgs: 'server',
                        limit: null,
                        nullable: true,
                        default: '-'
                    }
                ],
                list: [],
                view: [
                    {
                        name: 'team_id',
                        alias: null,
                        type: 'integer',
                        defaultIndex: 2,
                        longArgs: 'team_id',
                        limit: null,
                        nullable: true,
                        default: '-'
                    }
                ],
                apply: [
                    {
                        name: 'xf',
                        alias: 'xf',
                        type: 'string',
                        defaultIndex: 2,
                        longArgs: 'xf',
                        limit: null,
                        nullable: false,
                        default: null
                    },
                    {
                        name: 'game_id',
                        alias: null,
                        type: 'string',
                        defaultIndex: 3,
                        longArgs: 'game_id',
                        limit: {
                            min: 2,
                            max: 6
                        },
                        nullable: false,
                        default: null
                    },
                    {
                        name: 'team_id',
                        alias: null,
                        type: 'integer',
                        defaultIndex: 4,
                        longArgs: 'team_id',
                        limit: null,
                        nullable: true,
                        default: '-'
                    }
                ],
                cancel: [
                    {
                        name: 'team_id',
                        alias: null,
                        type: 'integer',
                        defaultIndex: 2,
                        longArgs: 'team_id',
                        limit: null,
                        nullable: true,
                        default: '-'
                    },
                    {
                        name: 'game_id',
                        alias: null,
                        type: 'string',
                        defaultIndex: 3,
                        longArgs: 'game_id',
                        limit: null,
                        nullable: true,
                        default: '-'
                    }
                ]
            }
        };
    }

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `团队命令，说明有空再写Orz`.replace(/[ ]{2,}/g, "");
    }
}