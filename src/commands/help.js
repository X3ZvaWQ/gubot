module.exports = class HelpHandler{
    async handle(ctx) {
        let args = ctx.state.args;
        console.log(args);
        if(args['command'] != null && route[args['command']] != undefined) {
            return route[args['command']].helpText();
        }
        return `欢迎使用“咕-bot”，以下是功能清单以及相关命令：
            1.花价查询 命令:/flowerPrice 花 服务器 地图
            2.科举查询 命令:/exam 关键字
            3.金价查询 命令:/goldPrice 服务器
            4.开服查询 命令:/serverStatus 服务器
            5.成就查询 命令:/achievement 关键字
            所有的命令都可以使用简写以及群管理员自定义的别名
            如有更多需求请在该机器人的github仓库区提交issue,机器人所有功能皆开源在github社区。
        `.replace(/[ ]{2,}/g,"");
    }

    static argsList() {
        return [{
            name: 'command',
            alias: 'command',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'command',
            limit: null,
            nullable: true,
            default: null
        }];
    }

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `帮助命令，可用命令有help、帮助以及群管理员自定义的别名。可接受0~1个参数
            1.具体命令，可为空。默认为显示命令清单，如提供该参数将会显示具体命令的详细说明
        `.replace(/[ ]{2,}/g,"");
    }
}