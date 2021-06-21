const Websocket = require('./websocket');

class CqHttp{
    wsApi;
    wsEvent;
    bot;
    name;

    constructor(config, bot) {
        this.wsApi = new Websocket(`${config.url}/api/${config.access_token ? '?access_token='+config.access_token : ''}`, `WsApi:${config.name}`);
        this.wsEvent = new Websocket(`${config.url}/event/${config.access_token ? '?access_token='+config.access_token : ''}`, `WsEvent:${config.name}`);
        this.name = config.url;
        this.bot = bot;
        let cqhttp = this;
        this.wsEvent.handleMessageStack.push(function(message) {
            let request = JSON.parse(message);
            let result = cqhttp.bot.handleRequest(request);
            //object
            if(typeof result == 'object') {
                cqhttp.send(result);
            }
            //string
            if(request.message_type == 'group') {
                let group_id = request.group_id;
                this.sendGroupMessage(result, group_id);
            }
            if(request.message_type == 'private') {
                let user_id = request.user_id;
                this.sendPrivateMessage(result, user_id)
            }
        });
    }

    sendPrivateMessage(message, user_id) {
        this.send({
            action: "send_private_msg",
            params: {
                user_id: user_id,
                message: message
            }
        });
    }

    sendGroupMessage(message, group_id){
        this.send({
            action: "send_group_msg",
            params: {
                group_id: group_id,
                message: message
            }
        });
    }

    send(object){
        this.wsApi.sendJSON(object);
    }
}

module.exports = CqHttp;