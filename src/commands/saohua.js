const Jx3Api = require('../service/httpApi/jx3api');

module.exports = class SaoHuaHandler {
    async handle() {
        let jx3api = new Jx3Api();
        return await jx3api.saohua();
    }

    static argsList() {
        return [];
    }
}