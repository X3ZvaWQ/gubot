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
        bot.log(`Websocket: ws [${this.name}] connected.`, 'success');
    }
    onClose(code, reason) {
        this.init();
        bot.log(`Websocket: ws [${this.name}] closed. Try to reconnect. \n    code: ${code}\n    reason: ${reason}`, 'error');
    }
    onError(error) {
        bot.log(`Websocket: ws [${this.name}] error. \n    message: ${error}`, 'error');
    }
    
    onMessage(message) {
        for(let id in this.requestWaiting){
            let waiting = this.requestWaiting[id];
            let _message = JSON.parse(message);
            if(!waiting.status && waiting.judge(_message)) {
                this.requestWaiting[id].status = true;
                this.requestWaiting[id].value = _message;
                return;
            }
        }
        for(let handle of this.handleMessageStack) {
            try{
                handle(message);
            }catch(e){
                if(typeof e == 'object') {
                    bot.log(message, 'error');
                    bot.log(e.stack || e, 'error');
                }
            }
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