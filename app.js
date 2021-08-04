require('colors');
const ENV = require('./env.json');
const Bot = require('./src/service/bot');

(async () => {
    const bot = new Bot(ENV);
    await bot.initRedis();
    await bot.initSequelize();
    await bot.initImageGenerator();
    await bot.initCqhttps();
    global.bot = bot;
    await bot.initWebsocketApi();
    await bot.initCommands();
    await bot.start();
})();

