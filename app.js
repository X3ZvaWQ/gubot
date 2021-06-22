require('colors');
const ENV = require('./env.json');
const Bot = require('./src/service/bot');

(async () => {
    const bot = new Bot(ENV);
    await bot.initRedis(ENV.redis);
    await bot.initSequelize(ENV.database);
    await bot.initImageGenerator(ENV.enable_puppeteer);
    await bot.initCqhttps(ENV.cqhttp_websockets);
    global.bot = bot;
    await bot.initCommands();
    await bot.start();
})();
