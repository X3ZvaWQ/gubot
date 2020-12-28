const moment = require('moment');
const _ = require('lodash');

module.exports = class GoldPriceHandler{
    async handle(ctx) {
        //get args from state
        let args = ctx.state.args;
        let key = 'GoldPrice';
        //get data from redis
        let goldPrice = await redis.get(key);
        //check data is empty?
        if(goldPrice != undefined && goldPrice != null && !args['update']) {
            goldPrice = JSON.parse(goldPrice);
        }else{
            let data = await helper.getGoldPrice();
            if(data.code != 0) {
                return (`ERROR: ${data.msg}`);
            }else{
                goldPrice = data.data
            }
            await redis.set(key, JSON.stringify(goldPrice));
            await redis.expire(key, 600);
        }
        
        //combine datas to string reply.
        let server = args.server;
        if(goldPrice[server] == undefined) {
            return (`ERROR: Unknown Server!\n错误：没找到这个服务器的数据。`);
        }
        goldPrice = goldPrice[server];
        return `---今日价格---
        贴吧：${_.mean(goldPrice['today']['post']).toFixed(2)}
        万宝楼：${_.mean(goldPrice['today']['official']).toFixed(2)}
        5173：${_.mean(goldPrice['today']['5173']).toFixed(2)}
        ---昨日价格---
        贴吧：${goldPrice['trend'][0]['post']}
        万宝楼：${goldPrice['trend'][0]['official']}
        5173：${goldPrice['trend'][0]['5173']}
        ----------------
        NaN表示无数据，数据来源于jx3box仅供参考。
        `.replace(/[ ]{2,}/g,"");
    }

    static argsList() {
        return [
            {
                name: 'server',
                alias: 'server',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'server',
                limit: null,
                nullable: true,
                default: '唯我独尊'
            },{
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
        `.replace(/[ ]{2,}/g,"");
    } 
}