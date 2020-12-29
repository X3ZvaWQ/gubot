const gubot = require('./src/main');

const koaApp = gubot.koaApp;
if(gubot.koaApp) {
    console.log('INFO: Http Post Server Koa Init Success.');
}
if(gubot.websocketClient) {
    console.log('INFO: Websocket Client Init Success.');
}