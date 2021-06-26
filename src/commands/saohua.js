const Jx3api = require('../service/httpApi/jx3api');

module.exports = class SaoHuaHandler {
    async handle() {
        return await Jx3api.saohua();
    }

    static argsList() {
        return [];
    }
}