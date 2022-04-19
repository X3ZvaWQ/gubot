const Wss = require('../../src/service/websocketServer');

let wss = new Wss(8080, '123456');
setInterval(() => {
    for(let client of wss._wss.clients) {
        client.send(JSON.stringify({
            type: 2001,
            data: {
                server: '梦江南',
                status: 1
            }
        }))
    }
}, 5000)