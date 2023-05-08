const Cqhttp = require("../../service/cqhttp");
const Logger = require("../../service/logger");

module.exports = class GroupNameHandler {
    name = "GroupName";

    args = [
        {
            name: "name",
            alias: null,
            displayName: "新的群名称",
            type: "string",
            limit: {
                min: 1,
                max: 6,
            },
            nullable: false,
            default: null,
        },
    ];

    init(registry) {
        registry.registerHandler(
            data =>
                data.post_type == "message" &&
                data.message_type == "group" &&
                data.message.startsWith("群名称"),
            this
        );
    }

    async handle(event) {
        const args = event.args;
        const user = event.user;
        const group = event.group;
        
        if (user.power < 4096) return;
        const new_name = args.name;
        Logger.info(
            `${this.name}: change groupname of [${group.group_id}] request by qq user [${user.qq}]`
        );
        return Cqhttp.setGroupName(group.group_id, new_name);
    }
};
