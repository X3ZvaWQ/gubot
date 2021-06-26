const Jx3box = require('../service/httpApi/jx3box');
const moment = require('moment');

module.exports = class AchievementHandler {
    async handle(ctx) {
        let args = ctx.args;
        let redis_key = `Achievement:${args.achievement}`;
        let result = await bot.redis.get(redis_key);
        if (result == null) {
            let id = await Jx3box.achievementSearch(args.achievement);
            let post = (await Jx3box.achievementPost(id)).data.post;
            let updated_at = moment(post.updated * 1000).locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
            let image = await bot.imageGenerator.generateFromHtml(post.content);
            result = `咕Bot - 成就攻略 - ${post.title}
            [CQ:image,file=file://${image}]
            以上内容来源于jx3box用户[${post.user_nickname}]。
            上次更新时间：[${updated_at}]`.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 3600);
        }
        return result;
    }

    static argsList() {
        return [{
            name: 'achievement',
            alias: 'achievement',
            displayName: '成就名称',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'key',
            limit: null,
            nullable: false
        }];
    }
}