const _ = require('lodash');
const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')

module.exports = class PriceHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;    
        let redis_key = `OutwardPrice:${args.name}`;
        //get data from redis
        let result = await redis.get(redis_key);
        //check data is empty?
        if (result == null || args['update'] || !await fs.exists(result)) {
            let id = await Api.searchOutwardFromXiaoHei(args.name);
            let data = await Api.getOutwardFromXiaoHei(id);
            let image = await Image.generateFromTemplateFile('outward', data, {
                selector: 'body'
            });
            result = image;
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 1800);
        }
        return Cq.ImageCQCode(`file://${result}`);
    }

    static argsList() {
        return [
            {
                name: 'name',
                alias: 'outward',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'name',
                limit: null,
                nullable: true,
                default: '狐金'
            },
            {
                name: 'update',
                alias: null,
                type: 'boolean',
                defaultIndex: 2,
                longArgs: 'update',
                limit: null,
                nullable: true,
                default: false
            }
        ];
    }
}