const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;
const allxf = require('../assets/json/xf.json');
const allxfid = require('../assets/json/xfid.json');
const allschool = require('../assets/json/school.json')
const allxftype = require('../assets/json/xftype.json');
const Alias = require('./alias');
const sequelize = bot.sequelize;

class Team extends Model {
    static async generateEmptyData(squad, group) {
        squad = squad.toLowerCase();
        let squads = squad.match(/(\d+\D+)/g);
        let _squads = [];
        let result = [];
        for (let i in squads) {
            let squad = squads[i];
            let [_, num, value] = squad.match(/(\d+)(\D+)/);
            let limits = value.split(/\!|\|/);
            let limit = {
                us: false,
                usid: -1,
                ux: false,
                uxid: -1,
                boss: false,
                num: num,
                xfs: [],
                schools: [],
                priority: 5,
                valid: false
            };

            for (let li in limits) {
                let xf = limits[li];
                //if xf is determiners
                if (xf == 'us') {
                    limit.us = true;
                    limit.usid = i;
                    continue;
                }
                if (xf == 'ux') {
                    limit.ux = true;
                    limit.uxid = i;
                    continue;
                }
                if (xf == 'boss') {
                    limit.boss = true;
                    limit.schools = Object.values(allschool.school);
                    limit.xfs = Object.keys(allxfid).map(x => parseInt(x));
                    limit.valid = true;
                    limit.priority = 4;
                    continue;
                }
                if (xf == 't') {
                    limit.xfs.push(...allxftype.t);
                    limit.valid = true;
                    limit.priority = 4;
                    continue;
                }
                if (xf == 'h') {
                    limit.xfs.push(...allxftype.h);
                    limit.valid = true;
                    limit.priority = 4;
                    continue;
                }
                if (xf == 'd') {
                    limit.xfs.push(...allxftype.dps);
                    limit.valid = true;
                    limit.priority = 4;
                    continue;
                }
                if (xf == 'n') {
                    limit.xfs.push(...allxftype.ng);
                    limit.valid = true;
                    limit.priority = 3;
                    continue;
                }
                if (xf == 'w') {
                    limit.xfs.push(...allxftype.wg);
                    limit.valid = true;
                    limit.priority = 3;
                    continue;
                }
                if (xf == 'j') {
                    limit.xfs.push(...allxftype.jz);
                    limit.valid = true;
                    limit.priority = 3;
                    continue;
                }
                if (xf == 'y') {
                    limit.xfs.push(...allxftype.yc);
                    limit.valid = true;
                    limit.priority = 3;
                    continue;
                }
                //if xf is a xf
                let _xf;
                if (group != undefined) {
                    _xf = await Alias.get(xf, 'xf', group);
                    _xf = xf == _xf ? await Alias.get(xf, 'xf') : _xf;
                } else {
                    _xf = await Alias.get(xf, 'xf');
                }
                if (allxf[_xf] != undefined) {
                    limit.valid = true;
                    limit.xfs.push(allxf[_xf].id);
                    limit.priority = 1;
                    continue;
                }
                throw `错误：请问${xf}是个什么东西？`;
            }
            _squads.push(limit);
        }
        _squads.sort((a, b) => a.priority - b.priority);
        for (let i in _squads) {
            let limit = _squads[i];
            for (let j = 0; j < limit.num; j++) {
                result.push({
                    boss: limit.boss,
                    xf: null,
                    xf_optional: limit.xfs,
                    uxid: limit.uxid,
                    school: null,
                    school_optional: limit.schools,
                    usid: limit.usid,
                    applied: false,
                    applicant: {
                        qq: null,
                        id: null,
                    }
                });
            }
        }
        result.sort((a, b) => a.xf_optional.length - b.xf_optional.length)
        for (let i = 0; i < result.length; i++) {
            result[i].id = i + 1;
        }
        return result;
    }
}

Team.init({
    name: {
        type: DataTypes.STRING,
    },
    squad: {
        type: DataTypes.STRING,
    },
    data: {
        type: DataTypes.TEXT,
    },
    remarks: {
        type: DataTypes.STRING,
    },
    time: {
        type: DataTypes.STRING
    },
    freeze: {
        type: DataTypes.BOOLEAN,
    }
}, {
    sequelize,
    paranoid: true,
    modelName: 'Team',
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});
module.exports = Team;
