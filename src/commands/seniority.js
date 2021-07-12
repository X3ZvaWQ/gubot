const Jx3api = require('../service/httpApi/jx3api');
const moment = require('moment');
const fs = require('fs-extra');

module.exports = class SeniorityHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = JSON.stringify('Seniority:' + JSON.stringify(args));
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        if (result == null || !await fs.exists(result) || args['update']) {
            let params = {};
            if(args.server != '全部服务器'){
                params.server = args.server;
            }
            if(args.school != '全部门派') {
                params.sect = args.school;
            }
            let datas = await Jx3api.seniority(params);
            params.server = args.server;
            params.sect = args.school;
            let renderData = {
                dataSource: 'JX3API',
                search: params,
                time: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss'),
                datas: datas
            };
            result = await bot.imageGenerator.generateFromTemplateFile('seniority', renderData, {
                selector: 'body > div'
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 60*60);
        } 
        return `[CQ:image,file=file://${result}]`;
    }

    static argsList() {
        return [{
            name: 'school',
            alias: 'school',
            displayName: '门派',
            type: 'string',
            defaultIndex: 1,
            shortArgs: 'school',
            longArgs: null,
            limit: null,
            nullable: true,
            default: '全部门派'
        }, {
            name: 'server',
            alias: 'server',
            displayName: '服务器',
            type: 'server',
            defaultIndex: 2,
            shortArgs: 'server',
            longArgs: null,
            limit: null,
            nullable: true,
            default: '全部服务器'
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