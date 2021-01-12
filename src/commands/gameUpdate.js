const Api = require('../service/api');

module.exports = class ServerStatusHandler{
    async handle(ctx) {
        //get args from state
        let args = ctx.state.args;
        let redis_key = 'GameUpdate';
        //get data from redis
        let serverStatus = await redis.get(redis_key);
        let servers = {};
        //check data is empty?
        
        return `[CQ:image,file=file://${file}]
        `.replace(/[ ]{2,}/g,"");
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

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `服务器状态命令，可用命令有开服、ss以及群管理员自定义的别名。接受0~2个参数
            1.服务器(--server)，可为空，默认为唯我独尊,
            2.更新(-u,--update)，可为空，默认不更新(5分钟刷新一次数据)
        `.replace(/[ ]{2,}/g,"");
    }
}