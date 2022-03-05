const CqHttp = require('../../service/cqhttp');

module.exports = class TeamListHandler {
    name = "TeamList";

    args = [];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message_type == 'group' &&
            data.message.startsWith('团队列表')
        ), this);
    }

    async handle(event) {
        let group = event.group;
        let teams = await group.getTeams();
        let texts = [];
        for (let i in teams) {
            let team = teams[i];
            texts.push(`${team.id}: ${team.name} - ${team.time}`);
        }
        let result = `[${group.groupname}]·团队列表
        ${texts.length ? texts.join('\n') : '当前暂无团队'}`.replace(/[ ]{2,}/g, "").replace(/\n[\s\n]+/g, "\n");
        return CqHttp.sendGroupMessage(result, group.group_id);
    }
}
