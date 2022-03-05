const CqHttp = require('../../service/cqhttp');
const Logger = require('../../service/logger');

module.exports = class GroupDecreaseHandler {
    name = "GroupDecrease";

    args = [];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'notice' &&
            data.notice_type == 'group_decrease'
        ), this);
    }

    async handle(event) {
        let data = event.data;
        let group = event.group;
        if (!group) return;
        let type = await data.sub_type;
        if (type == 'leave') {
            if (await group.getOption('group_leave_notice') == 'true')
                return CqHttp.sendGroupMessage(`${data.user_id} 默默地离开了我们......`, data.group_id);
        } else if (type == 'kick') {
            if (await group.getOption('group_kick_notice') == 'true')
                return CqHttp.sendGroupMessage(`${data.user_id} 被 ${data.operator_id} 请出了群......`, data.group_id);
        }
    }
}