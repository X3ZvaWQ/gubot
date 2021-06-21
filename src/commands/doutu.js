const Api = require('../service/api');

module.exports = class DouTuHandler {
    async handle() {
        let doutu = await Api.getDouTuFromJx3Api();
        return `[CQ:image,file=${doutu}]`;
    }

    static argsList() {
        return [];
    }
}