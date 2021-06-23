const Jx3Api = require('../service/httpApi/jx3api');
const fs = require('fs-extra')
const moment = require('moment');

module.exports = class ReinforcementHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Eye:${args.xf}`;
        let result = await bot.redis.get(redis_key);
        if (!result || !await fs.exists(result)) {
            let data = await Jx3Api.gest(args.xf);
            let table = [['重数', '效果']];
            for(let i in data) {
                if(i!='time' && i!='name' && i!= 'eye')
                table.push([i, data[i]]);
            }
            result = await bot.imageGenerator.generateFromArrayTable(table, {
                title: `咕Bot - 阵眼查询 - ${args.xf} - ${data.eye}`,
                tail: `数据获取时间：${moment(data.time).locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/api/eye\) 仅供参考`
            })
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
