const CqHttp = require("../../service/cqhttp");
const Subscribe = require("../../model/subscribe");
const lodash = require("lodash");

module.exports = class SubscribeAtHandler {
    name = "SubscribeAt";

    args = [
        {
            name: "message",
            alias: "message",
            displayName: "信息",
            type: "string",
            limit: null,
            nullable: false,
        },
    ];

    init(registry) {
        registry.registerHandler(
            (data) =>
                data.post_type == "message" && (data.message.startsWith("通知订阅") || data.message.startsWith("/as")),
            this
        );
    }

    async handle(event) {
        let data = event.data;
        let user = event.user;
        if (user.power < 512) return;
        if (!event.args.message) return;
        const group_id = data.group_id;
        const subscribes = await Subscribe.findAll({
            where: { group_id },
        });
        const qqs = subscribes.map((sub) => sub.user_qq);

        const chunks = lodash.chunk(qqs, 10);
        const ret = chunks.map((chunk) =>
            CqHttp.sendGroupMessage(chunk.map((qq) => CqHttp.CQ_at(qq)).join(""), data.group_id)
        );
        ret.push(CqHttp.sendGroupMessage(event.args.message, data.group_id));
        return ret;
    }
};
