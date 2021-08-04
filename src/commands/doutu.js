const Api = require('../service/api');
const CqHttp = require('../service/cqhttp');

module.exports = class DouTuHandler {
    async handle() {
        let doutu = await Api.getDouTuFromJx3Api();
        return CqHttp.imageCQCode(doutu);
    }

    static argsList() {
        return [];
    }
}