const Api = require('../service/api');
const allSerendipity = require('@jx3box/jx3box-data/data/serendipity/serendipity.json')
const moment = require('moment');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');
const { generateFromArrayTable } = require('../service/image');

module.exports = class SerendipityHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let key = JSON.stringify('Serendipity:' + JSON.stringify(args));
        //get data from redis
        let data = await redis.get(key);
        //check data is empty?
        if (data != undefined && data != null) {
            data = JSON.parse(data);
        } else {
            let serendipitys;
            if (args.serendipity != '全部奇遇') {
                serendipitys = allSerendipity
                    .filter(s => ((s.name == args.serendipity || s.type == args.serendipity) && s.languages[0] == 'zhcn'))
                    .map(x => x.name).join(',');
            } else {
                serendipitys = allSerendipity
                    .filter(s => s.languages[0] == 'zhcn')
                    .map(x => x.name).join(',');
            }

            if (serendipitys == '') {
                throw '错误: 你写的这玩意......他真的存在吗?';
            }
            data = await Api.getSerendipity({
                role: args.player,
                server: args.server,
                serendipity: serendipitys,
                pageSize: 50,
                start: 0
            });
            if (data.code == 0) {
                data = data.data.data;
            } else {
                throw '错误: 接口炸了，不关机器人的事儿';
            }
            await redis.set(key, JSON.stringify(data));
            await redis.expire(key, 300);
        }
        //combine datas to string reply.
        let array = [
            ['奇遇类型', '奇遇', '触发时间']
        ];
        if (data != null && data != 'null' && data.length > 0) {
            for (let i in data) {
                let type = await redis.get('SerendipityTypeOf:' + data[i].serendipity);
                if (type == null) {
                    type = allSerendipity.filter(x => x.name == data[i].serendipity)[0].type;
                    await redis.set('SerendipityTypeOf:' + data[i].serendipity, type);
                }
                array.push([type, data[i].serendipity, moment(data[i].dwTime * 1000).format('YYYY-MM-DD HH:mm:ss')]);
            }
        }

        return (`${args.player} 的奇遇记录
            ${array.length > 1 ? Cq.ImageCQCode('file://' + await generateFromArrayTable(array)) : '这位侠士这里光秃秃的，什么也没有。'}
            -----
            服务器：${args.server}
            数据来源于jx3box仅供参考。`).replace(/[ ]{2,}/g, "");
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
                nullable: false,
                default: null
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
                default: '绝世奇遇'
            }, {
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