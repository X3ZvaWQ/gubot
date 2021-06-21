const Api = require('../service/api');
const Image = require('../service/imageGenerator');
const Cq = require('../service/cqhttp');
const fs = require('fs-extra')
const moment = require('moment');

module.exports = class BpsHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `BpsGuide:${args.xf}`;
        let result = await redis.get(redis_key);
        if (!result || !await fs.exists(result)) {
            
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 600);
        }
        return `[CQ:image,file=file://${result}]`;
    }

    static argsList() {
        return [{
            name: 'xf',
            alias: 'xf',
            displayName: '心法',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'xf',
            limit: null,
            nullable: true,
            default: '冰心诀'
        }];
    }
}
