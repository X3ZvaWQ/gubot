const ENV = require('./env.json');
const Bot = require('./src/bot');

(async () => {
    const bot = new Bot(ENV);
    await bot.initRedis();
    await bot.initSequelize();
    await bot.initImageGenerator();
    await bot.initHandler();
    await bot.initWebsocketServer();
    await bot.start();
})();

