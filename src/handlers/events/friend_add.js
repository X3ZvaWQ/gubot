const CqHttp = require('../../service/cqhttp');
const Logger = require('../../service/logger');

module.exports = class FriendAddHandler {
    name = "FriendAdd";

    args = [];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'request' &&
            data.request_type == 'friend'), this);
    }

    async handle(event) {
        let data = event.data;
        let bot = event.bot;
        if(!bot) return;
        let allow = await bot.getOption('accept_add_friend') == 'true';
        if (allow) {
            Logger.info(`${this.name}: accept add friend request by qq user [${data.user_id}]`)
            return CqHttp.setFriendAddRequest(true, data.flag);
        }
    }
}