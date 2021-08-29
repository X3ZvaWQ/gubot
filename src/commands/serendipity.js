const Jx3box = require('../service/httpApi/jx3box');
const serendipityMap = require('../assets/json/serendipity.json');
const moment = require('moment');
const fs = require('fs-extra');
const CqHttp = require('../service/cqhttp');

module.exports = class SerendipityHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = JSON.stringify('Serendipity:' + JSON.stringify(args));
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        if (result == null || !await fs.exists(result) || args['update']) {
            let serendipity = args.serendipity;
            if (serendipity != '全部奇遇') {
                serendipity = serendipityMap
                    .filter(s => ((s.name == args.serendipity || s.type == args.serendipity) && s.languages[0] == 'zhcn'))
                    .map(x => x.name).join(',');
            } else {
                serendipity = '';
            }
            let player = args.player;
            if(player == '全部玩家') {
                player = '';
            }
            let searchKey = {
                server: args.server,
                role: player,
                serendipity: ''
            }
            let datas = await Jx3box.serendipity(searchKey);
            if(datas != null) {
                datas = datas.map((data) => ({
                    server: data.server,
                    player: data.name,
                    type: (serendipityMap.filter((s) => (s.name == data.serendipity))[0] || {type: '未知奇遇'}).type,
                    name: data.serendipity,
                    time: moment(data.dwTime*1000).locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')
                }));
            }else{
                datas = [
                    {
                        server: '',
                        player: '',
                        type: '',
                        name: '',
                        time: ''
                    }
                ]
            }
            searchKey.serendipity = args.serendipity;
            searchKey.player = args.player;
            let renderData = {
                dataSource: 'JX3BOX',
                search: searchKey,
                time: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss'),
                datas: datas
            };
            result = await bot.imageGenerator.generateFromTemplateFile('serendipity', renderData, {
                selector: 'body > div'
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 300);
        }
        return CqHttp.imageCQCode(result);
    }

    static argsList() {
        return [
            {
                name: 'player',
                alias: null,
                displayName: '角色名',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'flower',
                limit: null,
                nullable: true,
                default: '全部玩家'
            },
            {
                name: 'serendipity',
                alias: 'serendipity',
                displayName: '奇遇名称',
                type: 'string',
                defaultIndex: 2,
                shortArgs: null,
                longArgs: 'server',
                limit: null,
                nullable: true,
                default: ''
            },
            {
                name: 'server',
                alias: 'server',
                displayName: '服务器',
                type: 'server',
                defaultIndex: 3,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '-'
            }
        ];
    }
}
