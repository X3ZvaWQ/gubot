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
            type: 'boolean',
            defaultIndex: 2,
            shortArgs: 'u',
            longArgs: 'update',
            limit: null,
            nullable: true,
            default: false
        }];
    }

    static helpText() {
        return `沙盘查询命令，可用命令有sandbox、沙盘、sp以及群管理员自定义的别名。接受0~2个参数
            1.服务器(--server)，可为空，默认为唯我独尊,
            2.更新(-u,--update)，可为空，默认不更新(5分钟刷新一次数据)
        `.replace(/[ ]{2,}/g, "");
    }
}