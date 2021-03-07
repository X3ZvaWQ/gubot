const Api = require('../service/api');

module.exports = class SaoHuaHandler {
    async handle() {
        result = await Api.getSaoHuaFromJx3Api();
        return result
    }

    static argsList() {
        return [];
    }
}