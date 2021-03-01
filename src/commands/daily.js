const Api = require('../service/api');
const Cq = require('../service/cqhttp');
const Image = require('../service/image');
const fs = require('fs-extra')

module.exports = class ServerStatusHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = 'Daily';
        //get data from redis
        let result = await redis.get(redis_key);

        //check data is empty?
        if (!result || !await fs.exists(result) || args.update) {
            result = await Api.getDailyByJx3Api(args.server || null);
            let table = [];
            for(let i in result) {
                table.push([i, result[i]]);
            }
            result = Image.generateFromArrayTable(table, {
                head: '咕Bot - 日常查询',
                tail: `${result.时间} 周${result.星期}
                数据来源:[jx3api.com](https://jx3api.com/)`
            });
            await redis.set('Daily', result);
            await redis.expire('Daily', 600);
        }

        return `${Cq.ImageCQCode('file://' + result)}`;
    }

    static argsList() {
        return [{
            name: 'server',
            alias: 'server',
            type: 'server',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'server',
            limit: null,
            nullable: true,
            default: '-'
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
        }];
    }

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return ``.replace(/[ ]{2,}/g, "");
    }
}