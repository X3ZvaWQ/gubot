const WebSocket = require('ws');



const ws = new WebSocket('ws://192.168.1.139:8890/');
ws.on('open', function () {
    console.log(`[CLIENT] open()`);
    ws.send('Hello!');
});
// 给服务器发送一个字符串:
ws.on('message', function (message) {
    let o = JSON.parse(message);
    if(o.meta_event_type != 'heartbeat'){
        console.log(o)
        ws.send(JSON.stringify(
            {
                action: "send_group_msg",
                params: {
                    group_id: o.group_id,
                    message: "你好" + o.message
                }
            }
        ));
    }
});