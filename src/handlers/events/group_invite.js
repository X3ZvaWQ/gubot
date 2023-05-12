const CqHttp = require('../../service/cqhttp');
const Logger = require('../../service/logger');

module.exports = class GroupInviteHandler {
    name = "GroupInvite";

    args = [];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'request' &&
            data.request_type == 'group' &&
            data.sub_type == 'invite'), this);
    }

    async handle(event) {
        let data = event.data;
        let group = event.group;
        if(!group) return;
        let allow = await bot.getOption('accept_group_invite');
        if (allow == 'true') {
            Logger.info(`${this.name}: accept group [${data.group_id}] invite request by qq user [${data.user_id}]`)
            return CqHttp.setGroupInviteRequest(true, data.flag);
        }
    }
}