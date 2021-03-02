const Api = require('../service/api');

module.exports = class ServerStatusHandler {
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = 'ServerStatus';
        //get data from redis
        let serverStatus = await redis.get(redis_key);
        let servers = {};
        //check data is empty?
        if (serverStatus != undefined && serverStatus != null && !args['update']) {
            servers = JSON.parse(serverStatus);
        } else {
            let data = await Api.getServerStatus();
            if (data.code != 0) {
                return (`ERROR: ${data.msg}`);
            } else {
                serverStatus = data.data
            }
            for (let i in serverStatus) {
                servers[serverStatus[i]['serverName']] = serverStatus[i];
            }
            await redis.set(redis_key, JSON.stringify(servers));
            await redis.expire(redis_key, 300);
        }

        let server = args['server'];
        if (servers[server] == undefined) {
            return (`ERROR: Unknown Server!\n错误：没找到这个服务器的数据。`);
        }
        serverStatus = servers[server];
        return `---服务器状态---
        所属大区:${serverStatus.zoneName}
        主服务器:${serverStatus.mainServer}
        服务器:${serverStatus.serverName}
        IP地址:${serverStatus.ipAddress}
        连接状态:${serverStatus.connectState ? '可连接' : '不可连接'}
        ----------------
        数据来源于jx3box仅供参考。
        `.replace(/[ ]{2,}/g, "");
    }

    static argsList() {
        return [{
            name: 'server',
            alias: 'server',
            type: 'server',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'server',
            limit: null,
            nullable: true,
            default: '-'
        }, {
            name: 'update',
            alias: null,
            type: 'boolean',
            defaultIndex: 2,
            shortArgs: 'u',
            longArgs: 'update',
            limit: null,
            nullable: true,
            default: false
        }];
    }
}