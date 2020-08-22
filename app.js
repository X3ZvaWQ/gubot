const ENV = require('./env');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;

const route = require('./src/route')
const helper = require('./src/helper/function');
global.helper = helper;
global.route = route;

const Handler = require('./src/handler');

const app = new Koa();

app.use(bodyParser());
app.use(async ctx => {
    if(ctx.method == 'POST') {
        const data = ctx.request.body;
        if(data.post_type == 'message'){
            if(data.message.split('')[0] == '/'){
                let args = helper.commandParse(data.message);
                let command = args.shift().toString().substr(1);
                let handler = new Handler(command, args);
                let result = await handler.handle();
                if(result !== null) {
                    ctx.response.type = 'application/json'
                    ctx.response.body = JSON.stringify({
                        reply: result
                    });
                }
            }
        }
    }
});

app.listen(8891);
console.log('listening at port 8891 ...')
