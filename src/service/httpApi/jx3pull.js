const { $pull } = require("./axios");

class Jx3Pull {
    static apiDisplayName = "pull.jx3cx";

    static async randomJoke(id, server) {
        let response = await $pull.get(`/joke/random`);
        let data = response.data;
        if (data.code != 0) return;
        let content = data.data.content;
        return content;
    }
}

module.exports = Jx3Pull;
