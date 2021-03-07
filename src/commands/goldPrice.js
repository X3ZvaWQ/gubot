const _ = require('lodash');
const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')
const moment = require('moment');

module.exports = class GoldPriceHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `GoldPrice_${args.server}`;
        //get data from redis
        let result = await redis.get(redis_key);
        //check data is empty?
        if (result == null || !await fs.exists(result) || args['update']) {
            let table = [];

            let ark_data = (await Api.getGoldPriceFromArkwish()).data;
            if (ark_data[args.server] == undefined) {
                return (`ERROR: Unknown Server!\n错误：没找到这个服务器的数据。`);
            }   
            let tieba_gold = _.mean(ark_data[args.server]['today']['post']).toFixed(2);
            table.push(['贴吧', tieba_gold]);

            let data = await Api.getGoldPriceFromJx3Api(args.server);
            for(let i in data){
                if(i != 'server') {
                    table.push([i, data[i]]);
                }
            }

            table.sort((a, b) => a[1]- b[1]);
            table = [['渠道', '价格'], ...table];
            result = await Image.generateFromArrayTable(table, {
                title: `咕Bot - 金价查询 - ${_data.server}`,
                tail: `数据获取时间：${moment(data.time).locale('zh-cn').tz('Asia/Shanghai').format('YYYY-MM-DD LTS')}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/api/gold/\) 仅供参考`
            })
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 600);
        } 
        
        return `${Cq.ImageCQCode('file://' + result)}`;
    }

    static argsList() {
        return [
            {
                name: 'server',
                alias: 'server',
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