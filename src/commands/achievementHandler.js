const { htmlToText } = require('html-to-text');

module.exports = class AchievementHandler{
    async handle(ctx) {
        let args = ctx.state.args;
        let redis_key = `Achievement:${args.achievement}`;
        let context = await redis.get(redis_key);
        let result;
        if(context != null && context != undefined){
            result = context
        }else{
            let search = await helper.getAchievementSearch(args.achievement);
            let achievementID;

            if(search.code == 200 && search.data.achievements.length > 0){
                achievementID = search.data.achievements[0].ID;

            }else{
                return 'ERROR: Unknown Achievement!\n错误：没找到这个成就的数据。';
            }
            let post = await helper.getAchievementPost(achievementID);

            if(post.code == 200) {
                post = post.data.post.content;
                post = htmlToText(post, {
                    wordwrap: 130,
                    formatters: {
                        'imgFormatter': function (elem, walk, builder, formatOptions) {
                            const attribs = elem.attribs || {};
                            const alt = (attribs.alt)
                            ? he.decode(attribs.alt, builder.options.decodeOptions)
                            : '';
                            const src = (!attribs.src)
                            ? ''
                            : (formatOptions.baseUrl && attribs.src.indexOf('/') === 0)
                                ? formatOptions.baseUrl + attribs.src
                                : attribs.src;
                            const text = (!src)
                            ? alt
                            : (!alt)
                                ? `[CQ:image,file=${src},type=show,id=40000]`
                                : alt + ` [CQ:image,file=${src},type=show,id=40000]`;
                        
                            builder.addInline(text);
                        }
                    },
                    tags: {
                        //[CQ:image,file=http://baidu.com/1.jpg,type=show,id=40004]
                        'img': {
                        format: 'imgFormatter'
                        }
                    }
                });
                result = post;
            }else{
                return 'ERROR: Unknown Achievement!\n错误：没找到这个成就的数据。'
            }
        }
        await redis.set(redis_key, result);
        await redis.expire(redis_key, 600);

        return `----成就攻略----
        ${result}
        ----------------
        以上内容来源于jx3box，经过html转text可能有些失真。
        需要查看原版可以前往jx3box查看。`.replace(/[ ]{2,}/g,"").replace('\n\n \n\n \n \n ', '').replace('\n\n', '\n').replace('\n\n', '\n').replace('\n\n', '\n');
    }

    static argsList() {
        return [{
            name: 'achievement',
            alias: 'achievement',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'key',
            limit: null,
            nullable: false
        }];
    }

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `成就查询命令，可用命令有成就、cj以及群管理员自定义的别名。接受1个参数
            1.关键字，成就名。
        `.replace(/[ ]{2,}/g,"");
    }
}