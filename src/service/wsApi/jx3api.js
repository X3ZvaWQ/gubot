const websocket = require('../websocket');

class Jx3api{
    ws;
    handleMessageStack;

    constructor(url, name) {
        this.ws = new websocket(url, name)
        this.handleMessageStack = this.ws.handleMessageStack;
    }
}

module.exports = Jx3api;