const Cq = require("../service/cqhttp");
const Image = require("../service/image");

module.exports = class HelpHandler {
    async handle(ctx) {
        let args = ctx.args;
        if (args['command'] != null && route.commands[args['command']] != undefined) {
            return route.commands[args['command']].helpText();
        }
        let image = await Image.generateFromMarkdownFile('help');
        return Cq.ImageCQCode('file://' + image);
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
        `.replace(/[ ]{2,}/g, "");
    }
}