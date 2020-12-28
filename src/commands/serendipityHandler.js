const Api = require('../service/api');
const allSerendipity = require('@jx3box/jx3box-data/data/serendipity/serendipity.json')
const moment = require('moment');

module.exports = class SerendipityHandler{
    async handle(ctx) {
        //get args from state
        let args = ctx.state.args;
        let key = JSON.stringify('Serendipity:'+ JSON.stringify(args));
        //get data from redis
        let data = await redis.get(key);
        //check data is empty?
        if(data != undefined && data != null) {
            data = JSON.parse(data);
        }else{
            let serendipitys = allSerendipity
                .filter(s => ((s.name == args.serendipity || s.type == args.serendipity) && s.languages[0] == 'zhcn'))
                .map(x => x.name).join(',');
            if(serendipitys == '') {
                return 'ERROR: Serendipity Not Found.\n错误: 你写的这玩意......他真的存在吗?';
            }
            data = await Api.getSerendipity({
                role: args.player,
                server: args.server,
                serendipity: serendipitys,
                pageSize: 50,
                start: 0
            });
            if(data.code == 0) {
                data = data.data.data;
            }else{
                return 'ERROR: Server Error.\n错误: 接口炸了，不关机器人的事儿';
            }
            await redis.set(key, JSON.stringify(data));
            await redis.expire(key, 300);
        }
        //combine datas to string reply.
        let text = [];
        if(data != null && data != 'null' && data.length > 0) {
            for(let i in data) {
                text.push(`${allSerendipity.filter(x => x.name == data[i].serendipity)[0].type}·${data[i].serendipity} 触发于:${moment(data[i].dwTime*1000).format('YYYY-MM-DD HH:mm:ss')}`);
            }
        }else{
            text.push('这位侠士这里光秃秃的，什么也没有。');
        }
        
        return (`--${args.player} 的奇遇记录--
            ${text.join('\n')}
            ----------------------
            服务器：${args.server}
            数据来源于jx3box仅供参考。`).replace(/[ ]{2,}/g,"");
    }

    static argsList() {
        return [
            {
                name: 'player',
                alias: null,
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
                type: 'string',
                defaultIndex: 2,
                shortArgs: null,
                longArgs: 'server',
                limit: null,
                nullable: true,
                default: '绝世奇遇'
            },{
                name: 'server',
                alias: 'server',
                type: 'string',
                defaultIndex: 3,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '唯我独尊'
            }
        ];
    }

    static argsMissingError() {
        return this.helpText();
    }
    
    static helpText() {
        return `奇遇查询命令，用于查询某个人的奇遇。可用命令有serendipity、奇遇、qy以及群管理员自定义的别名。可接受0~3个参数
            1.id (--player)，不可为空。
            3.奇遇(--serendipity)，可为空，用“-”表示默认值，默认为绝世奇遇，可选值[具体奇遇名,绝世奇遇,世界奇遇,宠物奇遇,小宠奇遇,物品奇遇]。
            2.服务器(--server)，可为空，用“-”表示默认值，默认为唯我独尊。
        `.replace(/[ ]{2,}/g,"");
    } 
}