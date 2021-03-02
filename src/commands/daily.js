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
            result = await Api.getDailyFromJx3Api(args.server || null);
            let table = [['日常类型', '日常内容']];
            for(let i in result) {
                if(i != '时间' && i != '星期')
                table.push([i, result[i]]);
            }
            result = await Image.generateFromArrayTable(table, {
                title: '咕Bot - 日常查询',
                tail: `数据有效日期：${result.时间} 周${result.星期}  \n数据来源:\[jx3api.com\]\(https://jx3api.com/\)`
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

    static helpText() {
        return ``.replace(/[ ]{2,}/g, "");
    }
}