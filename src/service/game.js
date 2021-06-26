const Jx3box = require('./httpApi/jx3box');
const moment = require('moment');

class Game{
    static async flushServerList() {
        let servers = await Jx3box.servers();
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

    static async serverTest(s) {
        let server = s;
        const { Socket } = require('net');
        let connectTest = () => new Promise((resolve, reject) => {
            let socket = new Socket().on('connect', () => {
                socket.destroy();
                resolve('success')
            }).on('error', (e) => {
                socket.destroy();
                resolve('error');
            }).on('timeout', () => {
                socket.destroy();
                resolve('timeout');
            });
            socket.setTimeout(1000);
            socket.connect(server['ipPort'], server['ipAddress']);
        });
        let result = await connectTest();
        if(result == 'success') {
            server.connectState = true;
        }else{
            server.connectState = false;
        }
        server.checkTime = moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
        return server;
    }
}

module.exports = Game;