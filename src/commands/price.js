const fs = require('fs-extra');
const CqHttp = require('../service/cqhttp');
const XiaoHei = require('../service/httpApi/xiaohei');
const moment = require('moment');

module.exports = class PriceHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `OutwardPrice:${args.name}`;
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        if (result == null || args['update'] || !await fs.access(result)) {
            let outwardId = await XiaoHei.search(args.name);
            let outwardInfo = await XiaoHei.info(outwardId);
            let outwardSeconds = await XiaoHei.seconds(outwardId);
            let templateData = {
                info: outwardInfo,
                data: outwardSeconds,
                timestamps: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')
            };
            result = await bot.imageGenerator.generateFromTemplateFile('outward', templateData, {
                selector: 'body'
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 1800);
        }
        return CqHttp.imageCQCode(result);
    }

    static argsList() {
        return [
            {
                name: 'name',
                alias: 'outward',
                displayName: '外观名称',
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
                displayName: '刷新缓存',
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
