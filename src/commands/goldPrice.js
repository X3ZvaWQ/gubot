const moment = require('moment');
const _ = require('lodash');
const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')

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
            let _data = data.data;
            for(let i in _data){
                if(i != 'server') {
                    let map = {
                        5173: '5173',
                        7881: '7881',
                        dd373: 'dd373',
                        uu898: 'uu898',
                        wanbaolou: '万宝楼',
                        youmu: '游募'
                    }
                    table.push([map[i], _data[i]]);
                }
            }

            table.sort((a, b) => a[1]- b[1]);
            table = [['渠道', '价格'], ...table];
            result = await Image.generateFromArrayTable(table, {
                title: '咕Bot - 金价查询',
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

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `金价查询命令，可用命令有gold、金价、jj以及群管理员自定义的别名。可接受0~2个参数
            1.服务器(--server)，可为空，默认为唯我独尊,
            2.更新(-u,--update)，可为空，默认不更新(10分钟刷新一次数据)
        `.replace(/[ ]{2,}/g, "");
    }
}