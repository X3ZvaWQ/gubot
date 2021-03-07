const Api = require('../service/api');

module.exports = class SaoHuaHandler {
    async handle() {
        return await Api.getSaoHuaFromJx3Api();
    }

    static argsList() {
        return [];
    }
}