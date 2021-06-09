const Api = require('../service/api');
const Cq = require('../service/cqhttp');
const Image = require('../service/image');
const fs = require('fs-extra');
const Game = require('../service/game');

module.exports = class ServerStatusHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = `ServerStatus:${args.server}`;
        //get data from redis
        let result = await redis.get(redis_key);
        if (result == null || !await fs.exists(result) || args['update']) {
            let server;
            try{
                server = await Game.getServerInfo(args.server);
                if(server == null) {
                    throw '错误：该服务器不存在。';
                }
                server = await Api.getServerStatus(server);
            }catch(e) {
                throw e;
            }
            result = await Image.generateFromTemplateFile('serverStatus', server);
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 30);
        }
        return Cq.ImageCQCode('file://' + result);
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
}