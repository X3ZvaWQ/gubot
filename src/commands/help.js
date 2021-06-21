const Cq = require("../service/cqhttp");
const Image = require("../service/image");

module.exports = class HelpHandler {
    async handle(ctx) {
        let args = ctx.args;
        if (args['command'] != null && await Image.MarkdownFileExist(`help/${args['command']}`)) {
            let image = await Image.generateFromMarkdownFile(`help/${args['command']}`);
            return `[CQ:image,file=file://${image}]`;
        }
        let image = await Image.generateFromMarkdownFile('help/help');
        return `[CQ:image,file=file://${image}]`;
    }

    static argsList() {
        return [{
            name: 'command',
            alias: 'command',
            displayName: '具体命令',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'command',
            limit: null,
            nullable: true,
            default: null
        }];
    }
}