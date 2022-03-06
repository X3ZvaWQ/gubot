const Cqhttp = require('../../service/cqhttp');

module.exports = class EchoHandler {
    name = "Echo";

    args = [{
        name: 'message',
        alias: 'message',
        displayName: '服务器',
        type: 'string',
        limit: null,
        nullable: true,
        default: '-'
    }];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message.startsWith('/echo')
        ), this);
    }

    async handle(event) {
        let data = event.data;
        if (data.message_type == 'private') {
            return CqHttp.sendPrivateMessage(event.args['message'], data.user_id);
        } else {
            return Cqhttp.sendGroupMessage(event.args['message'], data.group_id)
        }
    }
}