const CqHttp = require('../../service/cqhttp');

module.exports = class AtAllHandler {
    name = "AtAll";

    args = [{
        name: 'message',
        alias: 'message',
        displayName: '@全体的信息',
        type: 'string',
        limit: null,
        nullable: false,
        default: '-'
    }];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            (data.message.startsWith('/atAll') ||
                data.message.startsWith('全体目光向我看齐,我宣布个事儿!'))
        ), this);
    }

    async handle(event) {
        let data = event.data;
        let user = event.user;
        if (user.power < 512) return;
        if (data.message_type == 'private') {
            return CqHttp.sendPrivateMessage(event.args.message, data.user_id);
        } else {
            return CqHttp.sendGroupMessage(CqHttp.CQ_at('all') + event.args.message, data.group_id)
        }
    }
}