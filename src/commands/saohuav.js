const Api = require('../service/api');

module.exports = class SaoHuaHandler {
    async handle() {
        let saohuav = await Api.getSaoHuaFromJx3Api();
        return `[CQ:tts,text=${saohuav}]`;
    }

    static argsList() {
        return [];
    }
}