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
        let redis_key = `Travel:${args.map}`;
        //get data from redis
        let result = await redis.get(redis_key);
        //check data is empty?
        const getResult = (map) => {
            let data = await Api.getTravelFromJx3Api(map);
            let furnitures = data.data;
            let images = [];
            for(let i in furnitures){
                images.push(await Image.generateFromTemplateFile('furniture', furnitures[i]));
            }
            return result;
        }
        if (result == null || args['update']) {
            result = getResult(args.map);
            await redis.set(redis_key, JSON.stringify(result));
            await redis.expire(redis_key, 86400);
        } 
        let cache_valid = true;
        for(let i in result) {
            if(!await fs.exists(result[i])){
                cache_valid = false;
            }
        }
        if(cache_valid) {
            return result.map(x => Cq.ImageCQCode(`file://${result}`)).join();
        }else{
            result = getResult(args.map);
            await redis.set(redis_key, JSON.stringify(result));
            await redis.expire(redis_key, 86400);
        }
        return result.map(x => Cq.ImageCQCode(`file://${result}`)).join();
    }

    static argsList() {
        return [
            {
                name: 'map',
                alias: 'map',
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