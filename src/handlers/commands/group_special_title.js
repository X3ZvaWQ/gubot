const Cqhttp = require("../../service/cqhttp");
const Logger = require("../../service/logger");

module.exports = class GroupSpecialTitleHandler {
    name = "GroupSpecialTitle";

    args = [
        {
            name: "special_title",
            alias: null,
            displayName: "想要的头衔",
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
            (data) =>
                data.post_type == "message" && data.message_type == "group" && data.message.startsWith("我要头衔 "),
            this
        );
    }

    async handle(event) {
        let args = event.args;
        let user = event.user;
        let group = event.group;
        const allow = (await group.getOption("allow_self_special_title")) == "true";
        if (!allow) return;
        let special_title = args.special_title;
        Logger.info(`${this.name}: allow group [${group.group_id}] special title request by qq user [${user.qq}]`);
        return [
            Cqhttp.setGroupSpecialTitle(group.group_id, user.qq, special_title),
            Cqhttp.sendGroupMessage(
                `${user.nickname ? `${user.nickname}(${user.qq})` : data.user_id} 给自己带上了 ${special_title} 的帽子`,
                group.group_id
            ),
        ];
    }
};
