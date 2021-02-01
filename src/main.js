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
    global.redis = new Proxy({}, {
        get: () => (async () => null),
    });
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
/* const permission = require('./middleware/permissions'); */
/* const argsProcess = require('./middleware/argsProcess'); */
const Bot = require('./service/bot');

if(ENV.enable_puppeteer){
    (async () => {
        const Image = require('./service/image');
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch();
        Image.puppeteer = browser;
    })()
}

const bot = new Bot();

let koaApp;
if(ENV.use_http_post) {
    //require and instance koa
    const Koa = require('koa');
    const bodyParser = require('koa-bodyparser');
    koaApp = new Koa();
    koaApp.use(bodyParser());
    /* koaApp.use(argsProcess); */
    /* koaApp.use(permission); */

    koaApp.use(async ctx => {
        if(ctx.method == 'POST') {
            const data = ctx.request.body;
            if(data.post_type == 'message'){
                if(data.message.split('')[0] == '/'){
                    let result = await bot.handleCommand(data);
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

let websocketClient;
if(ENV.use_websocket) {
    const WebSocket = require('ws');
    const wsApi = new WebSocket(`${ENV.websocket_url}/api/${ENV.access_token ? '?access_token='+ENV.access_token : ''}`);
    const wsEvent = new WebSocket(`${ENV.websocket_url}/event/${ENV.access_token ? '?access_token='+ENV.access_token : ''}`);
    wsApi.on('open', () => {
        console.log('INFO: Api WebSocket Server connected.');
    });
    wsEvent.on('open', () => {
        console.log('INFO: Event WebSocket Server connected.');
    });
    wsEvent.on('message',async (message) => {
        const data = JSON.parse(message);
        if(data.post_type == 'message'){
            let result;
            if(data.message.split('')[0] == '/'){
                result = await bot.handleCommand(data);
            }else{
                result = await bot.handleMessage(data);
            }
            if(result != null && result != undefined && result != ''){
                if(data.message_type == 'group') {
                    let group_id = data.group_id;
                    wsApi.send(JSON.stringify({
                        action: "send_group_msg",
                        params: {
                            group_id: group_id,
                            message: result
                        }
                    }));
                }else if(data.message_type == 'private'){
                    let user_id = data.user_id;
                    wsApi.send(JSON.stringify({
                        action: "send_private_msg",
                        params: {
                            user_id: user_id,
                            message: result
                        }
                    }));
                }
            }
        }else if(data.post_type == 'request'){

        }else if(data.post_type == 'notice'){

        }
    });
    websocketClient = {
        event: wsEvent,
        api: wsApi
    }
}

module.exports = {
    koaApp: koaApp,
    websocketClient: websocketClient
};
