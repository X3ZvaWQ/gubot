const { fromString } = require('html-to-text');
const Api = require('../service/api');
const Cq = require('../service/cqhttp');
const Image = require('../service/image');
const fs = require('fs-extra')
const fonts = require('../../env.json').image_fonts;

module.exports = class ServerStatusHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = 'GameUpdate';
        //get data from redis
        let result = await redis.get(redis_key);

        //check data is empty?
        if (!result || !await fs.exists(result)) {
            result = await Image.getFromUrl('https://jx3.xoyo.com/launcher/update/latest.html', { selector: 'body div:first-of-type', evaluate: `document.querySelector('body div:first-of-type').style.width = '720px';document.querySelector('body div:first-of-type').style.padding = '2rem';document.querySelectorAll('body span').forEach(x => x.style.fontFamily = "${fonts || "'Noto Sans SC', sans-serif, 'consolas'"}")`});
            await redis.set('GameUpdate', result);
            await redis.expire('GameUpdate', 600);
        }

        return `${Cq.ImageCQCode('file://' + result)}`;
    }

    static argsList() {
        return [{
            name: 'update',
            alias: null,
            type: 'boolean',
            defaultIndex: 1,
            shortArgs: 'u',
            longArgs: 'update',
            limit: null,
            nullable: true,
            default: false
        }];
    }
}