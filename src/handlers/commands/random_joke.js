const CqHttp = require("../../service/cqhttp");
const Jx3Pull = require("../../service/httpApi/jx3pull");
module.exports = class RandomJokeHandler {
    name = "RandomJoke";

    args = [];

    init(registry) {
        registry.registerHandler(
            data =>
                data.post_type == "message" &&
                data.message.endsWith("整点骚话"),
            this
        );
    }

    async handle(event) {
        let data = event.data;

        let result = await Jx3Pull.randomJoke();

        if (data.message_type == "private") {
            return CqHttp.sendPrivateMessage(result, data.user_id);
        } else {
            return CqHttp.sendGroupMessage(result, data.group_id);
        }
    }
};
