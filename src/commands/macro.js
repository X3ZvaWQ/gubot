const Jx3box = require('../service/httpApi/jx3box');
const Jx3api = require('../service/httpApi/jx3api');
const xfs = require('../assets/json/xf.json');
const xfids = require('../assets/json/xfid.json');
const CqHttp = require('../service/cqhttp');

module.exports = class MacroHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Macro:${JSON.stringify(args)}`;
        let result = await bot.redis.get(redis_key);
        if (result == null) {
            let kungfu = xfs[args.xf];
            if (kungfu == undefined) {
                throw `错误：未知的心法 ${args.xf}`;
            }
            let kungfuid = kungfu.id;
            //根据rank 判断从jx3api获取数据还是从jx3box获取数据
            //-1从jx3api拿，0从jx3box的宏推荐拿，1-10从jx3box的宏排名拿
            let macroId;
            if(args.rank < 1) {
                if(args.rank == -1) {
                    let data = await Jx3api.macro(args.xf);
                    result = `咕bot ${data.name} 宏 来源jx3api
                    ------
                    ${data.content}
                    ------
                    ${data.talents}`;
                }else if(args.rank == 0) {
                    let recommandList = await Jx3box.macroRecommand();
                    macroId = recommandList.filter((macro) => (macro.icon == kungfu.icon))[0];
                    //如果找不到推荐宏的话就直接从排行榜取
                    if(macroId == undefined) {
                        ctx.args.rank = 1;
                        return await this.handle(ctx);
                    }
                    macroId = parseInt(macroId.link.match(/\/macro\/(\d+)/)[1]);
                }
            }else{
                let rank = await Jx3box.macroTops(kungfuid);
                rank = rank[args.rank - 1];
                macroId = rank.pid
            }
            //如果result已经有值了就跳过这一段代码
            //否则说明macroId已经有值，需要根据postId从jx3box解析对应宏
            if(result == null){
                let post = await Jx3box.macroContent(macroId);
                let macros = post.post_meta.data.map(async (macro) => {
                    let talents;
                    if (macro.talent != '' && macro.talent != null) {
                        try {
                            let talent = JSON.parse(macro.talent);
                            let redis_talent_key = `Talent:${talent.xf}_${talent.version}`
                            let talentList = await bot.redis.get(redis_talent_key);
                            if(talentList == null) {
                                talentList = await Jx3box.talentsList(talent.version || 'v20201030');
                                talentList = talentList[talent.xf];
                                await bot.redis.set(redis_talent_key, JSON.stringify(talentList));
                            }else{
                                talentList = JSON.parse(talentList);
                            }
                            talents = talent.sq.split(',');
                            for (let i in talents) {
                                talents[i] = talentList[`${parseInt(i) + 1}`][talents[i]]['name'];
                            }
                        } catch (e) {
                            talents = ['作者上传的奇穴方案有误，无法解析'];
                        }
                    } else {
                        talents = ['无奇穴方案'];
                    }
                    return {
                        name: `${post.author}#${macro.name}`,
                        qixue: talents.join(','),
                        speed: macro.speed != '' ? macro.speed : null,
                        remark: macro.desc != '' ? macro.desc : null,
                        content: macro.macro
                    };
                });
                for(let m in macros) {
                    macros[m] = await macros[m];
                }
                let data = {
                    rank: args.rank,
                    author: post.author,
                    game_version: post.meta_1,
                    macro_name: post.post_title,
                    xf: xfids[post.meta_2],
                    macro: macros
                }
                let macro_sync = macros.map((x) => x.name);
                result = `${CqHttp.imageCQCode(await bot.imageGenerator.generateFromTemplateFile('macro', data))}
                    云端宏:
                    ${macro_sync.join('\n')}`;
            }
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 86400);
        }
        return result.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
    }

    static argsList() {
        return [{
            name: 'xf',
            alias: 'xf',
            displayName: '心法',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'xf',
            limit: null,
            nullable: false
        }, {
            name: 'rank',
            alias: null,
            displayName: '排名',
            type: 'integer',
            defaultIndex: 2,
            shortArgs: null,
            longArgs: 'rank',
            limit: {
                min: -1,
                max: 10
            },
            nullable: true,
            default: 0
        }];
    }
}
