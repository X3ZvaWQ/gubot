const fs = require('fs-extra');
const Game = require('../service/game');
const CqHttp = require('../service/cqhttp');

module.exports = class ServerStatusHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `ServerStatus:${args.server}`;
        //get data from redis
        let result = await bot.redis.get(redis_key);
        if (result == null || !await fs.exists(result) || args['update']) {
            let server;
            try{
                server = await Game.getServerInfo(args.server);
                if(server == null) {
                    throw '错误：该服务器不存在。';
                }
                server = await Game.serverTest(server);
            }catch(e) {
                throw e;
            }
            result = await bot.imageGenerator.generateFromTemplateFile('serverStatus', server);
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 30);
        }
        return CqHttp.imageCQCode(result);
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
