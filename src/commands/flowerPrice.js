const Api = require('../service/api');

const moment = require('moment');
module.exports = class FlowerPriceHandler{
    async handle(ctx) {
        //get args from state
        let args = ctx.state.args;
        let key = JSON.stringify('FlowerPrice:'+args);
        //get data from redis
        let flowerPrice = await redis.get(key);
        //check data is empty?
        if(flowerPrice != undefined && flowerPrice != null && !args['update']) {
            flowerPrice = JSON.parse(flowerPrice);
        }else{
            let response = await Api.getFlowerPriceFromSpider(args);
            if(JSON.stringify(response.data) == '{}') {
                return 'ERROR: Empty Response.\n错误: 花价查询接口返回为空，请检查参数是否正确'
            }
            flowerPrice = response.data
            await redis.set(key, JSON.stringify(flowerPrice));
            await redis.expire(key, 300);
        }
        //combine datas to string reply.
        let text = [];
        let price = flowerPrice;
        for(let i in price) {
            let lines = price[i]['maxLine'].slice(0,3).join(',');
            text.push(`${args.server}·${i}·${args.map}
            线路：${lines}
            日期：${moment().format('YYYY-MM-DD')}`);
        }
        return (text.join('\n—————————\n')+`数据来源于jx3box仅供参考。`).replace(/[ ]{2,}/g,"");
    }

    static argsList() {
        return [
            {
                name: 'flower',
                alias: 'flower',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'flower',
                limit: null,
                nullable: true,
                default: '绣球花'
            },
            {
                name: 'server',
                alias: 'server',
                type: 'string',
                defaultIndex: 2,
                shortArgs: null,
                longArgs: 'server',
                limit: null,
                nullable: true,
                default: '唯我独尊'
            },{
                name: 'map',
                alias: 'map',
                type: 'string',
                defaultIndex: 3,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '广陵邑'
            },{
                name: 'update',
                alias: null,
                type: 'boolean',
                defaultIndex: 4,
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
        return `花价查询命令，可用命令有flower、花价、hj以及群管理员自定义的别名。可接受0~3个参数
            1.花的种类(--flower)，可为空，默认为绣球花
            2.服务器(--server)，可为空，默认为唯我独尊
            3.地图(--map)，可为空，默认为广陵邑
            4.更新(-u,--update)，可为空，默认不更新(5分钟刷新一次数据)

        `.replace(/[ ]{2,}/g,"");
    } 
}