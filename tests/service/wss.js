const Wss = require('../../src/service/websocketServer');
const Ws = require('../../src/service/websocket');

let wss = new Wss(8080, 'access_token');