const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')
import { XiaoHei } from '../service/httpApi/xiaohei';

module.exports = class PriceHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `OutwardPrice:${args.name}`;
        //get data from redis
        let result = await redis.get(redis_key);
        //check data is empty?
        if (result == null || args['update'] || !await fs.access(result)) {
            let xiaohei = new XiaoHei();
            let outwardId = await xiaohei.search(args.name);
            let outwardInfo = await xiaohei.info(outwardId);
            let outwardSeconds = await xiaohei.seconds(outwardId);
            let templateData = {
                info: outwardInfo,
                data: outwardSeconds
            };
            result = await Image.generateFromTemplateFile('outward', templateData, {
                selector: 'body'
            });
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