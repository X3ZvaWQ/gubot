const Api = require('../service/api');
const Cq = require('../service/cqhttp');

module.exports = class SandBoxHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `SandBox:${args.server}`;
        //get data from redis
        let result = await redis.get(redis_key);
        if (result == null) {
            try {
                let [area, server, updated_at, sandbox_image] = await Api.getSandBox(args.server);
                result = `------沙盘查询------
                ${Cq.ImageCQCode(sandbox_image)}
                --------------
                服务器：${area}·${server}
                上次更新时间：${updated_at}`;
                await redis.set(redis_key, result);
                await redis.expire(redis_key, 21600);
            } catch (e) {
                result = `ERROR: Get Sandbox Image Error.\n 错误：无法获取数据.`
            }
        }
        return result.replace(/[ ]{2,}/g, "");
    }

    static argsList() {
        return [{
            name: 'server',
            alias: 'server',
            displayName: '服务器',
            type: 'server',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'server',
            limit: null,
            nullable: true,
            default: '-'
        }, {
            name: 'update',
            alias: null,
            displayName: '刷新缓存',
            type: 'boolean',
            defaultIndex: 2,
            shortArgs: 'u',
            longArgs: 'update',
            limit: null,
            nullable: true,
            default: false
        }];
    }
}