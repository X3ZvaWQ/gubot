const Jx3api = require('../service/httpApi/jx3api');

module.exports = class SaoHuaHandler {
    async handle() {
        let saohuav = await Jx3api.saohua();
        return `[CQ:tts,text=${saohuav}]`;
    }

    static argsList() {
        return [];
    }
}