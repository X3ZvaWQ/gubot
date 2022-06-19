const CqHttp = require('../../service/cqhttp');

module.exports = class GameUpdateHandler {
    name = "GameUpdate";

    args = [{
        name: 'update',
        alias: 'boolean',
        displayName: '是否刷新缓存',
        type: 'boolean',
        limit: null,
        nullable: true,
        default: 'false'
    }];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message.startsWith('游戏更新')
        ), this);
    }

    async handle(event) {
        let data = event.data;
        //get args from state
        let redis_key = 'GameUpdate';
        //get data from redis
        let result = await bot.redis.get(redis_key);

        //check data is empty?
        if (!result || !await fs.exists(result)) {
            result = await bot.imageGenerator.getFromUrl('https://jx3.xoyo.com/launcher/update/latest.html', { selector: 'body div:first-of-type', evaluate: `document.querySelector('body div:first-of-type').style.width = '720px';document.querySelector('body div:first-of-type').style.padding = '2rem';document.querySelectorAll('body span').forEach(x => x.style.fontFamily = "'Noto Sans SC', sans-serif, 'consolas'")` });
            await bot.redis.set('GameUpdate', result);
            await bot.redis.expire('GameUpdate', 600);
        }

        if (data.message_type == 'private') {
            return CqHttp.sendPrivateMessage(CqHttp.CQ_image(result), data.user_id);
        } else {
            return CqHttp.sendGroupMessage(CqHttp.CQ_image(result), data.group_id)
        }
    }
}