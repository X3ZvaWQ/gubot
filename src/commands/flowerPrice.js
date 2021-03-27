const Api = require('../service/api');

module.exports = class FlowerPriceHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let parms = {
            server: args.server,
            map: args.map,
            type: args.flower
        }
        let key = JSON.stringify('FlowerPrice:' + JSON.stringify(parms));
        //get data from redis
        let flowerPrice = await redis.get(key);
        //check data is empty?
        if (flowerPrice != undefined && flowerPrice != null && !args['update']) {
            flowerPrice = JSON.parse(flowerPrice);
        } else {
            let response = await Api.getFlowerPriceFromSpider(parms);
            if (JSON.stringify(response.data) == '{}') {
                throw 'ERROR: Empty Response.\n错误: 花价查询接口返回为空，请检查参数是否正确'
            }
            flowerPrice = response.data
            await redis.set(key, JSON.stringify(flowerPrice));
            await redis.expire(key, 300);
        }
        //combine datas to string reply.
        let text = [];
        let price = flowerPrice;
        for (let i in price) {
            let lines = price[i].branch.map((x) => x.number);
            text.push(`${price[i].server}·${price[i].name}·${price[i].map}
            线路：${lines.join(',')}
            日期：${price[i].date}`);
        }
        return (text.join('\n—————————\n') + `\n数据来源于jx3box仅供参考。`).replace(/[ ]{2,}/g, "");
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
                type: 'server',
                defaultIndex: 2,
                shortArgs: null,
                longArgs: 'server',
                limit: null,
                nullable: true,
                default: '-'
            }, {
                name: 'map',
                alias: 'map',
                type: 'string',
                defaultIndex: 3,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '广陵邑'
            }, {
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
}