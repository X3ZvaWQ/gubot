const Jx3Api = require('../service/httpApi/jx3api');

module.exports = class SaoHuaHandler {
    async handle() {
        return await Jx3Api.saohua();
    }

    static argsList() {
        return [];
    }
}