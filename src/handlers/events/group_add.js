const CqHttp = require('../../service/cqhttp');
const Logger = require('../../service/logger');

module.exports = class GroupAddHandler {
    name = "GroupAdd";

    args = [];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'request' &&
            data.request_type == 'group' &&
            data.sub_type == 'add'), this);
    }

    async handle(event) {
        let data = event.data;
        let group = event.group;
        if(!group) return;
        let allow = await bot.getOption('accept_group_add');
        if (allow == 'true') {
            Logger.info(`${this.name}: accept group [${data.group_id}] add request by qq user [${data.user_id}]`)
            return CqHttp.setFriendAddRequest(true, data.flag);
        }else if (allow =='keyword'){
            let keyword = await bot.getOption('accept_group_add_keyword');
            if(typeof data.comment == 'string' && data.comment.indexOf(keyword)) {
                Logger.info(`${this.name}: accept group [${data.group_id}] add request by qq user [${data.user_id}], comment: ${data.comment}`)
                return CqHttp.setFriendAddRequest(true, data.flag);
            }
        }
    }
}