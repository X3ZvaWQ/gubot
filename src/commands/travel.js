const Jx3Api = require('../service/httpApi/jx3api');
const fs = require('fs-extra')

module.exports = class TravelHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `Travel:${args.map}`;
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        const getResult = async (map) => {
            let data = await Jx3Api.travel(map);
            let furnitures = data.data;
            let images = [];
            for (let i in furnitures) {
                images.push(await bot.imageGenerator.generateFromTemplateFile('furniture', furnitures[i]));
            }
            return images;
        }
        if (result == null || args['update'] || result == 'null') {
            result = await getResult(args.map);
            await bot.redis.set(redis_key, JSON.stringify(result));
            await bot.redis.expire(redis_key, 86400);
        } else {
            let cache_valid = true;
            result = JSON.parse(result);
            if (result instanceof Array) {
                for (let i in result) {
                    if (!await fs.exists(result[i])) {
                        cache_valid = false;
                    }
                }
            } else {
                cache_valid = false;
            }
            if (!cache_valid) {
                result = await getResult(args.map);
                await bot.redis.set(redis_key, JSON.stringify(result));
                await bot.redis.expire(redis_key, 86400);
            }
        }
        return result.map(x => `[CQ:image,file=file://${x}]`).join('\n');
    }

    static argsList() {
        return [
            {
                name: 'map',
                alias: 'map',
                displayName: '地图',
                type: 'map',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '七秀'
            }
        ];
    }
}