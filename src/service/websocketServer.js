const Wss = require('ws').Server;
const Bot = require('../model/bot');
const Logger = require('./logger');

class WebsocketServer {
    messageHandler = [];
    clients = {};

    constructor(port, token) {
        this.port = port;
        this.token = token;
        this.init();
    }

    init() {
        const wss = this;
        this._wss = new Wss({
            port: this.port
        });
        this._wss.on('connection', (ws, request) => {
            if (request.url.indexOf(`access_token=${this.token}`) == -1) {
                Logger.warn(`WebsockerServer: ws client ${request.socket.remoteAddress} connect failure because of wrong token!`);
                ws.terminate();
            } else {
                Logger.info(`WebsockerServer: ws client ${request.socket.remoteAddress} connected!`);
            }
            ws.on('message',  (message) => {
                wss.onMessage(message, ws);
            });
        });
        //每30秒清理掉不发心跳包的客户端
        setInterval(function ping() {
            let clients = wss.clients;
            if (typeof clients == 'array') {
                clients.forEach((ws) => {
                    if (ws.isAlive === false) {
                        Logger.warn(`WebsockerServer: ws client ${ws} lost connection!`);
                        return ws.terminate();
                    }
                    ws.isAlive = false;
                });
            }
        }, 30000);
    }

    async onMessage(message, ws) {
        let data = JSON.parse(message);
        if (data['post_type'] == 'meta_event' && data['meta_event_type'] == 'lifecycle' && data['sub_type'] == 'connect') {
            //gocqhttp连接后发的第一个事件
            let self_id = data['self_id'];
            this.clients[self_id] = ws;
            ws.bot = (await Bot.findOrCreate({
                where: {
                    self_id: self_id
                }
            }))[0];
            Logger.success(`WebsockerServer: go-cqhttp client, id [${self_id}] connected!`);
        } else if (data['post_type'] == 'meta_event' && data['meta_event_type'] == 'heartbeat') {
            //心跳事件
            ws.isAlive = true;
        } else {
            //其他事件交给事件处理器处理
            for (let handler of this.messageHandler) {
                try {
                    handler(message, ws);
                } catch (e) {
                    Logger.error(`websockerServer Error while handle message ${message}, handler: ${handler}`);
                    Logger.error(e);
                }
            }
        }
    }
}

module.exports = WebsocketServer;