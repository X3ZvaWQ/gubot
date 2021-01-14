//require env config
const ENV = require('../env.json');

//make redis connection
if(ENV.use_redis){
    const redis = require('async-redis');
    const client = redis.createClient({
        host: ENV.redis_host || 'localhost',
        port: ENV.redis_port || 6379
    });
    client.on("error", function (err) {
        console.log("Redis Error: " + err);
    });
    global.redis = client;
}else{
    global.redis = {
        get: async () => null,
        set: async () => null,
        expire: async () => null
    }
}

(async () => {
  const Image = require('../src/service/image');
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  Image.puppeteer = browser;
  console.log(await Image.generateFromMarkdown('help'));
  await browser.close();
  process.exit();
})();