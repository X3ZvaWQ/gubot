const Ws = require('ws');

class Websocket{
    handleMessageStack = []
    requestWaiting = []

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
        for(let waiting of this.requestWaiting){
            //TODO
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

    async request(object) {
        //TODO
    }
}

module.exports = Websocket;