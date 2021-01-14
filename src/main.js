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

//make mysql connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;

//add global helper function and route
const route = require('./route')
const helper = require('./helper/function');
const CqHttp = require('./service/cqhttp');
global.Cq = CqHttp;
global.helper = helper;
global.route = route;
//require and use middleware
const Handler = require('./handler');
const permission = require('./middleware/permissions');
const argsProcess = require('./middleware/argsProcess');

if(ENV.enable_puppeteer){
    (async () => {
        const Image = require('./service/image');
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch();
        Image.puppeteer = browser;
    })()
}

let koaApp;
if(ENV.use_http_post) {
    //require and instance koa
    const Koa = require('koa');
    const bodyParser = require('koa-bodyparser');
    koaApp = new Koa();
    koaApp.use(bodyParser());
    koaApp.use(argsProcess);
    /* koaApp.use(permission); */

    koaApp.use(async ctx => {
        
        if(ctx.method == 'POST') {
            const data = ctx.request.body;
            if(data.post_type == 'message'){
                if(data.message.split('')[0] == '/'){
                    let handler = new Handler(ctx);
                    let result = await handler.handle();
                    if(result !== null) {
                        ctx.response.type = 'application/json',
                        ctx.response.body = JSON.stringify({
                            reply: result
                        });
                    }
                }
            }
        }
    });
    koaApp.listen(ENV.http_post_port || 8891);
    console.log(`listening at port ${ENV.http_post_port || 8891} ...`)
}

if(ENV.use_websocket) {
    //todo...
}

module.exports = {
    koaApp: koaApp,
    websocketClient: null
};
