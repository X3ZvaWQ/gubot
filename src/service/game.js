const Api = require('./api');

class Game{
    static async flushServerList() {
        let servers = await Api.getServerListFromJx3Box();
        await bot.redis.set(`ServerList`, JSON.stringify(servers));
        await bot.redis.expire(`ServerList`, 12*60*60);
        return servers;
    }

    static async getServerInfo(name) {
        let result = await bot.redis.get(`ServerInfo:${name}`);
        if(result != null) {
            return JSON.parse(result);
        }
        let serverList = await bot.redis.get(`ServerList`);
        if(serverList == null) {
            serverList = await Game.flushServerList();
        }else{
            serverList = JSON.parse(serverList);
        }
        result = serverList[name];
        if(result == null) {
            return null;
        }
        return result;
    }
}

module.exports = Game;