const ENV = require('../env.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;

if(ENV.use_redis){
    const redis = require('async-redis');
    const client = redis.createClient({
        host: ENV.redis_host || 'localhost',
        port: ENV.redis_port || 6379
    });
    client.on("error", function (err) {
        console.log("Redis Error: " + err);
    });
    global.redis = client;
}else{
    global.redis = new Proxy({}, {
        get: () => (async () => null),
    });
}

const allxf = require('@jx3box/jx3box-data/data/xf/xf.json');
const allxfid = require('@jx3box/jx3box-data/data/xf/xfid.json'); 
const allschool = require('@jx3box/jx3box-data/data/xf/school.json');
const allxftype = require('../src/assets/json/xftype.json');
const Alias = require('../src/model/alias');

async function generateEmptyData(squad, group) {
    squad = squad.toLowerCase();
    let squads = squad.match(/(\d+\D+)/g);
    let _squads = [];
    let result = [];
    for(let i in squads){
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

        for(let li in limits) {
            let xf = limits[li];
            //if xf is determiners
            if(xf == 'us'){
                limit.us = true;
                limit.usid = i;
            }
            if(xf == 'ux'){
                limit.ux = true;
                limit.uxid = i;
            }
            if(xf == 'b'){
                limit.boss = true;
                limit.schools = Object.values(allschool.school);
                limit.xfs = Object.keys(allxfid).map(x => parseInt(x));
                limit.valid = true;
                limit.priority = 4;
                continue;
            }
            if(xf == 't'){
                limit.xfs.push(...allxftype.t);
                limit.valid = true;
                limit.priority = 4;
                continue;
            }
            if(xf == 'h'){
                limit.xfs.push(...allxftype.h);
                limit.valid = true;
                limit.priority = 4;
                continue;
            }
            if(xf == 'd'){
                limit.xfs.push(...allxftype.dps);
                limit.valid = true;
                limit.priority = 4;
                continue;
            }
            if(xf == 'n'){
                limit.xfs.push(...allxftype.ng);
                limit.valid = true;
                limit.priority = 3;
                continue;
            }
            if(xf == 'w'){
                limit.xfs.push(...allxftype.wg);
                limit.valid = true;
                limit.priority = 3;
                continue;
            }
            if(xf == 'j'){
                limit.xfs.push(...allxftype.jz);
                limit.valid = true;
                limit.priority = 3;
                continue;
            }
            if(xf == 'y'){
                limit.xfs.push(...allxftype.yc);
                limit.valid = true;
                limit.priority = 3;
                continue;
            }
            //if xf is a xf
            let _xf;
            if(group != undefined) {
                _xf = await Alias.get(xf, 'xf', group);
                _xf = xf == _xf ? await Alias.get(xf, 'xf') : _xf;
            }else{
                _xf = await Alias.get(xf, 'xf');
            }
            if(allxf[_xf] != undefined){
                limit.valid = true;
                limit.xfs.push(allxf[_xf].id);
                limit.priority = 1;
                continue;
            }
        }
        _squads.push(limit);
    }
    _squads.sort((a,b) => a.priority - b.priority);
    for(let i in _squads){
        let limit = _squads[i];
        for(let j = 0; j < limit.num; j++){
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
                    nickname: null,
                    id: null,
                }
            });
        }
    }
    return result;
}

(async () => {
    console.log(await generateEmptyData('2T!US4H!US9N9W1B'));
})();