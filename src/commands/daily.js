const Jx3api = require('../service/httpApi/jx3api');
const fs = require('fs-extra')

module.exports = class ServerStatusHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = 'Daily';
        //get data from redis
        let result = await bot.redis.get(redis_key);

        //check data is empty?
        if (!result || !await fs.exists(result) || args.update) {
            result = await Jx3api.daily(args.server || null);
            let table = [['日常类型', '日常内容']];
            for(let i in result) {
                if(i != '时间' && i != '星期')
                table.push([i, result[i]]);
            }
            result = await bot.imageGenerator.generateFromArrayTable(table, {
                title: '咕Bot - 日常查询',
                tail: `数据有效日期：${result.时间} 周${result.星期}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/\)`
            });
            await bot.redis.set('Daily', result);
            await bot.redis.expire('Daily', 600);
        }

        return `[CQ:image,file=file://${platform}${result}]`;
    }

    static argsList() {
        return [{
            name: 'server',
            alias: 'server',
            displayName: '服务器',
            type: 'server',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'server',
            limit: null,
            nullable: true,
            default: '-'
        },
        {
            name: 'update',
            alias: null,
            displayName: '刷新缓存',
            type: 'boolean',
            defaultIndex: 2,
            longArgs: 'update',
            limit: null,
            nullable: true,
            default: false
        }];
    }
}
