const Jx3api = require('../service/httpApi/jx3api');
const fs = require('fs-extra');
const CqHttp = require('../service/cqhttp');

module.exports = class FurnitureHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Furniture:${args.name}`;
        let result = await bot.redis.get(redis_key);

        if (result == null || args['update'] || !await fs.exists(result)) {
            let furniture = await Jx3api.furniture(args.name);
            result = await bot.imageGenerator.generateFromTemplateFile('furniture', furniture);
            await bot.redis.set(redis_key, JSON.stringify(result));
            await bot.redis.expire(redis_key, 86400);
        }
        return CqHttp.imageCQCode(result);
    }

    static argsList() {
        return [
            {
                name: 'name',
                alias: 'furniture',
                displayName: '家具名',
                type: 'furniture',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '阿修罗像'
            }
        ];
    }
}
