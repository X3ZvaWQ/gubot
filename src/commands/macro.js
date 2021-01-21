const Api = require('../service/api');
const xfs = require('@jx3box/jx3box-data/data/xf/xf.json');
const xfids = require('@jx3box/jx3box-data/data/xf/xfid.json')
const Image = require('../service/image');
const Cq = require('../service/cqhttp');

module.exports = class MacroHandler{
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Macro:${JSON.stringify(args)}`;
        let result = await redis.get(redis_key);
        if(result == null) {
            let kungfuid = xfs[args.xf];
            if(kungfuid == undefined) {
                return 'ERROR: Unknown xf.\n错误：未知的心法';
            }
            kungfuid = kungfuid.id;
            let rank = await Api.getMacroTops(kungfuid);
            if(rank == null || rank.length == 0) {
                return 'ERROR: Spide Macro Rank Error.\n错误：抓取该心法宏排行时出现错误';
            }
            rank = rank[args.rank - 1];
            let post = await Api.getMacroContent(rank.pid);
            if(post.code != 10064) {
                return 'ERROR: Spide Macro Content Error.\n错误：抓取宏内容时出现错误';
            }
            post = post.data.post;
            let macro_qixues = post.post_subtype;
            let qixue_xf = await redis.get(`QiXues:${macro_qixues}`);
            if(qixue_xf == null) {
                qixue_xf = await Api.getQiXue();
                if(qixue_xf == null) {
                    return 'ERROR: Spide QiXue Content Error.\n错误：抓取奇穴内容时出现错误';
                }
                qixue_xf = qixue_xf[macro_qixues];
                await redis.set(`QiXues:${macro_qixues}`, JSON.stringify(qixue_xf));
                await redis.expire(`QiXues:${macro_qixues}`, 604800);
            }else{
                qixue_xf = JSON.parse(qixue_xf);
            }
            let macros = post.post_meta.data.map((macro) => {
                let qixues;
                if(macro.talent != '' && macro.talent != null){
		    try{
	                let macro_qixue = JSON.parse(macro.talent);
			qixues = macro_qixue.sq.split(',');
			for(let i in qixues) {
			    qixues[i] = qixue_xf[`${parseInt(i)+1}`][qixues[i]]['name'];
			}
	            }catch(e){
		        qixues = ['作者上传的奇穴方案有误，无法解析'];
		    }
                }else{
                    qixues = ['无奇穴方案'];
                }
                return {
                    name: `${post.author}#${macro.name}`,
                    qixue: qixues.join(','),
                    speed: macro.speed != '' ? macro.speed : null,
                    remark: macro.desc != '' ? macro.desc : null,
                    content: macro.macro
                };
            });
            let data = {
                rank: args.rank,
                author: post.author,
                game_version: post.meta_1,
                macro_name: post.post_title,
                xf: xfids[post.meta_2],
                macro: macros
            }
            let macro_sync = macros.map((x) => x.name);
            result = `云端宏:
            ${macro_sync.join('\n')}
            详细内容:
            ${Cq.ImageCQCode('file://'+ await Image.generateFromTemplateFile('macro', data))}`;
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 86400);
        }
        return result.replace(/[ ]{2,}/g,"").replace(/\n[\s\n]+/g,"\n");
    }

    static argsList() {
        return [{
            name: 'xf',
            alias: 'xf',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'xf',
            limit: null,
            nullable: false
        },{
            name: 'rank',
            alias: null,
            type: 'integer',
            defaultIndex: 2,
            shortArgs: null,
            longArgs: 'rank',
            limit: {
                min: 1,
                max: 10
            },
            nullable: true,
            default: 1
        }];
    }

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `宏查询命令，可用命令有macro、宏、h 以及群管理员自定义的别名。接受1个参数
            1.心法，不可为空。可以使用标准心法或者管理员自定义的别名。
            2.排名，整数（1~10）选择排名第几的宏。可以为空，默认使用排行榜第一的宏。
        `.replace(/[ ]{2,}/g,"");
    }
}
