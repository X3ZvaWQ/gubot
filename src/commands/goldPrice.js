const Jx3api = require('../service/httpApi/jx3api');
const fs = require('fs-extra')
const moment = require('moment');
const CqHttp = require('../service/cqhttp');

module.exports = class GoldPriceHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `GoldPrice_${args.server}`;
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        if (result == null || !await fs.exists(result) || args['update']) {
            let table = [];
            let data = await Jx3api.gold(args.server);
            for(let i in data){
                if(i != 'server' && i != 'time') {
                    table.push([i, data[i]]);
                }
            }

            table.sort((a, b) => a[1]- b[1]);
            table = [['渠道', '价格'], ...table];
            result = await bot.imageGenerator.generateFromArrayTable(table, {
                title: `咕Bot - 金价查询 - ${data.server}`,
                tail: `数据获取时间：${moment(data.time).locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/api/gold/\) 仅供参考`
            })
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 600);
        }

        return CqHttp.imageCQCode(result);
    }

    static argsList() {
        return [
            {
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
            }, {
                name: 'update',
                alias: null,
                displayName: '刷新缓存',
                type: 'boolean',
                defaultIndex: 2,
                shortArgs: 'u',
                longArgs: 'update',
                limit: null,
                nullable: true,
                default: false
            }
        ];
    }
}
