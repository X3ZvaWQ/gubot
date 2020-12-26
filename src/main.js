//require env config
const ENV = require('../env');

//make redis connection
const redis = require('async-redis');
const client = redis.createClient({
    host: ENV.redis_host || 'localhost',
    port: ENV.redis_port || 6379
});
client.on("error", function (err) {
    console.log("Redis Error: " + err);
});
global.redis = client;

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
global.helper = helper;
global.route = route;

//require and instance koa
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Handler = require('./handler');

const app = new Koa();

//require and use middleware
const permission = require('./middleware/permissions');
const argsProcess = require('./middleware/argsProcess');

app.use(bodyParser());
app.use(argsProcess);
/* app.use(permission); */

app.use(async ctx => {
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

module.exports = app;
