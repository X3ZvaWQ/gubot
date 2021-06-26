const Jx3api = require('../service/httpApi/jx3api');
const fs = require('fs-extra')
const moment = require('moment');

module.exports = class ReinforcementHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Reinforcement:${args.xf}`;
        let result = await bot.redis.get(redis_key);
        if (!result || !await fs.exists(result)) {
            let data = await Jx3api.strengthen(args.xf);
            let table = [['小药类型', '小药名']];
            for(let i in data) {
                table.push([i, data[i]]);
            }
            result = await bot.imageGenerator.generateFromArrayTable(table, {
                title: `咕Bot - 小药查询 - ${args.xf}`,
                tail: `数据获取时间：${moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/api/reinforcement\) 仅供参考  \n**注意：接口给出的都是紫色小药，很贵。**  \n**建议小地图右下方小扳手->枫影插件集->材料药品查询 找蓝色的小吃小药**  `
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 600);
        }
        return `[CQ:image,file=file://${result}]`;
    }

    static argsList() {
        return [{
            name: 'xf',
            alias: 'xf',
            displayName: '心法',
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
