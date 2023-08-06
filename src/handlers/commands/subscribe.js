const CqHttp = require("../../service/cqhttp");
const User = require("../../model/user");
const Subscribe = require("../../model/subscribe");

module.exports = class SubscribeHandler {
    name = "Subscribe";

    args = [];

    init(registry) {
        registry.registerHandler(
            (data) =>
                data.post_type == "message" &&
                (data.message == "打本叫我" || data.message == "有乐子叫我" || data.message == "休息一会儿"),
            this
        );
    }

    async handle(event) {
        const data = event.data;
        const user = event.user;
        const opr_nickname = user ? user.nickname : data.user_id;

        if (data.message_type == "private") return;
        const enable = data.message != "休息一会儿";
        if (enable) {
            const [subscribe, created] = await Subscribe.findOrCreate({
                where: {
                    group_id: data.group_id,
                    user_qq: user.qq,
                },
            });
            if (created) {
                return CqHttp.sendGroupMessage(`${opr_nickname} 订阅了消息提醒`, data.group_id);
            }
        } else {
            const subscribe = await Subscribe.findOne({
                where: {
                    group_id: data.group_id,
                    user_qq: user.qq,
                },
            });
            if (!subscribe) return;
            await subscribe.destroy();
            return CqHttp.sendGroupMessage(`${opr_nickname} 取消了消息提醒`, data.group_id);
        }
    }
};
