const Jx3tuilan = require('../service/httpApi/jx3tuilan');
const fs = require('fs-extra')
const moment = require('moment');

module.exports = class ReinforcementHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `JJC_Player:${args.player}_${args.server}`;
        let result = await bot.redis.get(redis_key);
        if (!result || !await fs.exists(result) || args.update) {
            let data = await Jx3tuilan.jjc_info(args.player, args.server);
            data['time'] = moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
            data['player'] = `${args.player} - ${args.server}`;
            result = bot.imageGenerator.generateFromTemplateFile('jjc', {
                data: data
            }, {
                selector: 'body > div'
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 600);
        }
        return `[CQ:image,file=file://${result}]`;
    }

    static argsList() {
        return [{
            name: 'player',
            alias: null,
            displayName: '角色姓名',
            type: 'string',
            defaultIndex: 1,
            shortArgs: 'player',
            longArgs: null,
            limit: null,
            nullable: false,
            default: null
        }, {
            name: 'server',
            alias: 'server',
            displayName: '服务器',
            type: 'string',
            defaultIndex: 2,
            shortArgs: 'server',
            longArgs: null,
            limit: null,
            nullable: true,
            default: '-'
        }, {
            name: 'update',
            alias: 'boolean',
            displayName: '刷新缓存',
            type: 'boolean',
            defaultIndex: 3,
            shortArgs: 'u',
            longArgs: 'update',
            limit: null,
            nullable: true,
            default: false
        }];
    }
}
