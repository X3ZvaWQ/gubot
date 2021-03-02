const { htmlToText } = require('html-to-text');
const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');

module.exports = class AchievementHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Achievement:${args.achievement}`;
        let result = await redis.get(redis_key);
        if (result == null) {
            let search = await Api.getAchievementSearch(args.achievement);
            let achievementID;

            if (search.code == 200 && search.data.achievements.length > 0) {
                achievementID = search.data.achievements[0].ID;
            } else {
                return 'ERROR: Unknown Achievement!\n错误：没找到这个成就的数据。';
            }
            let id = achievementID;
            let name = search.data.achievements[0].Name;
            let post = (await Api.getAchievementPost(id)).data.post;
            let html = post.content;
            let updated_at = moment(post.updated * 1000).tz('Asis/Shanghai').locale('zh-cn').format('YYYY-MM-DD LTS');
            let image = await Image.generateFromHtml(html);
            result = `咕Bot - 成就攻略 - ${name}
            ${Cq.ImageCQCode('file://' + image)}
            以上内容来源于jx3box用户${post.user_nickname}。
            上次更新时间：${updated_at}
            需要查看原版可以前往jx3box查看。`.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 3600);
        }
        return result;
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

    static helpText() {
        return `成就查询命令，可用命令有成就、cj以及群管理员自定义的别名。接受1个参数
            1.关键字，成就名。
        `.replace(/[ ]{2,}/g, "");
    }
}