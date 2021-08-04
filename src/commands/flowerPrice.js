const Jx3box = require('../service/httpApi/jx3box');
const fs = require('fs-extra');
const CqHttp = require('../service/cqhttp');

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
        let result = await bot.redis.get(key);
        //get data from redis
        //check data is empty?
        if (result == null || args['update'] || await fs.exists(result)) {
            let flowerPrice = await Jx3box.flower(parms);
            result = await bot.imageGenerator.generateFromTemplateFile('flowerPrice', {
                price: flowerPrice
            });
            await bot.redis.set(key, result);
            await bot.redis.expire(key, 300);
        }
        return CqHttp.imageCQCode(result);
    }

    static argsList() {
        return [
            {
                name: 'flower',
                alias: 'flower',
                displayName: '花种类',
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
                displayName: '服务器',
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
                displayName: '地图',
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
                displayName: '刷新缓存',
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
