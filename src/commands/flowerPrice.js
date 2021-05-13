const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')

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
        let result = await redis.get(key);
        //get data from redis
        //check data is empty?
        if (result == null || args['update'] || await fs.exists(result)) {
            let response = await Api.getFlowerPriceFromSpider(parms);
            if (JSON.stringify(response.data) == '{}') {
                throw 'ERROR: Empty Response.\n错误: 花价查询接口返回为空，请检查参数是否正确'
            }
            let flowerPrice = response.data
            if(flowerPrice == undefined || flowerPrice.length < 1) {
                throw 'ERROR: Empty Response.\n错误: 花价查询接口返回为空，请检查参数是否正确'
            }
            result = await Image.generateFromTemplateFile('flowerPrice', {
                price: flowerPrice
            });
            await redis.set(key, result);
            await redis.expire(key, 300);
        }
        return Cq.ImageCQCode('file://' + result).replace(/[ ]{2,}/g, "");
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