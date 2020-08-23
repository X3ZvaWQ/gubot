const Alias = require('../model/alias')

module.exports = class HelpHandler{
    async handle(args, data) {
        if(args[0] != undefined) {
            if(route[args[0]] != undefined) {
                return route[args[0]].helpText();
            }else{
                let command = await Alias.get(args[0], 'command');
                if(route[command] != undefined) {
                    return route[command].helpText();
                }
            }
        }
        return `欢迎使用“咕-bot”，以下是功能清单以及相关命令：
            1.花价查询 命令:/flowerPrice 花 服务器 地图
            2.科举查询 命令:/exam 关键字
            3.别名设置 请/help alias 查看
            如有更多需求请在该机器人的github仓库区提交issue。
            本机器人所有功能皆开源在github社区，禁止用于商业盈利。
        `.replace(/[ ]{2,}/g,"");
    }

    static helpText() {
        return `帮助命令，可用命令有help、帮助以及群管理员自定义的别名。可接受0~1个参数
            1.具体命令，可为空。默认为显示命令清单，如提供该参数将会显示具体命令的详细说明
        `.replace(/[ ]{2,}/g,"");
    }
}