const CqHttp = require("../../service/cqhttp");
const foodList = require("../../assets/json/foodLists.json");
const { sampleSize } = require("lodash");

module.exports = class RandomFoodHandler {
    name = "RandomFood";

    args = [];

    init(registry) {
        registry.registerHandler(
            data =>
                data.post_type == "message" && data.message.endsWith("吃什么"),
            this
        );
    }

    async handle(event) {
        let data = event.data;
        let result = sampleSize(foodList, 3).join("、");
        result = `或许你可以试试：${result}`;
        if (data.message_type == "private") {
            return CqHttp.sendPrivateMessage(result, data.user_id);
        } else {
            return CqHttp.sendGroupMessage(result, data.group_id);
        }
    }
};
