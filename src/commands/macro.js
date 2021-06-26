const Jx3box = require('../service/httpApi/jx3box');
const xfs = require('@jx3box/jx3box-data/data/xf/xf.json');
const xfids = require('@jx3box/jx3box-data/data/xf/xfid.json')

module.exports = class MacroHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Macro:${JSON.stringify(args)}`;
        let result = await bot.redis.get(redis_key);
        if (result == null) {
            let kungfuid = xfs[args.xf];
            if (kungfuid == undefined) {
                throw `\n错误：未知的心法 ${args.xf}`;
            }
            kungfuid = kungfuid.id;
            let rank = await Jx3box.macroTops(kungfuid);
            rank = rank[args.rank - 1];
            let post = await Jx3box.macroContent(rank.pid);
            post = post.post;
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
            result = `[CQ:image,file=file://${await bot.imageGenerator.generateFromTemplateFile('macro', data)}]
                云端宏:
                ${macro_sync.join('\n')}`;
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
                min: 1,
                max: 10
            },
            nullable: true,
            default: 1
        }];
    }
}
