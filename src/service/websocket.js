const Ws = require('ws');
const uuid = require('uuid').v4;

class Websocket{
    handleMessageStack = [];
    requestWaiting = {};

    constructor(url, name) {
        this.name = name;
        this.url = url;
        this.init();
    }

    init() {
        const ws = this;
        this._ws = new Ws(this.url);
        this._ws.on('open', function() {
            ws.onOpen();
        });
        this._ws.on('close', function(code, reason) {
            ws.onClose(code, reason);
        });
        this._ws.on('error', function(error) {
            ws.onError(error);
        });
        this._ws.on('message', function(message) {
            ws.onMessage(message);
        });
    }

    onOpen() {
        console.log(`Websocket: ws [${this.name}] connected.`.yellow);
    }
    onClose(code, reason) {
        console.log(`Websocket: ws [${this.name}] closed. \n    code: ${code}\n    reason: ${reason}`.red);
    }
    onError(error) {
        console.log(`Websocket: ws [${this.name}] error. \n    message: ${error}`.red);
    }
    onMessage(message) {
        for(let id in this.requestWaiting){
            let waiting = this.requestWaiting[id];
            message = JSON.parse(message);
            if(!waiting.status && waiting.judge(message)) {
                this.requestWaiting[id].status = true;
                this.requestWaiting[id].value = message;
                return;
            }
        }
        for(let handle of this.handleMessageStack) {
            handle(message);
        }
    }

    send(data) {
        this._ws.send(data);
    }

    sendJSON(object) {
        this.send(JSON.stringify(object));
    }

    async request(object, judgeFunction) {
        this.sendJSON(object);
        return await this.getResponse(judgeFunction);
    }

    async getResponse(judgeFunction) {
        let id = uuid();
        this.requestWaiting[id] = {
            judge: judgeFunction,
            status: false,
            value: null
        };
        let ws = this;
        await new Promise(function(resolve) {
            let timer = setInterval(function() {
                if(ws.requestWaiting[id].status) {
                    resolve(true);
                    clearInterval(timer);
                }
            }, 10)
        })
        let value = this.requestWaiting[id].value;
        delete this.requestWaiting[id];
        return value;
    }
}

module.exports = Websocket;