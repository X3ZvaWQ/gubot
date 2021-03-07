const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')
const moment = require('moment');

module.exports = class ReinforcementHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Reinforcement:${args.xf}`;
        let result = await redis.get(redis_key);
        if (!result || !await fs.exists(result)) {
            let data = await Api.getReinforcementFromJx3Api(args.xf);
            let table = [['小药类型', '小药名']];
            for(let i in data) {
                table.push([i, data[i]]);
            }
            result = await Image.generateFromArrayTable(table, {
                title: `咕Bot - 小药查询 - ${args.xf}`,
                tail: `数据获取时间：${moment().locale('zh-cn').tz('Asia/Shanghai').format('YYYY-MM-DD LTS')}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/api/reinforcement\) 仅供参考  \n**注意：接口给出的都是紫色小药，很贵。**  \n**建议小地图右下方小扳手->枫影插件集->材料药品查询 找蓝色的小吃小药**  `
            });
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 600);
        }
        return `${Cq.ImageCQCode('file://' + result)}`;
    }

    static argsList() {
        return [{
            name: 'xf',
            alias: 'xf',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'xf',
            limit: null,
            nullable: true,
            default: '冰心诀'
        }];
    }
}
