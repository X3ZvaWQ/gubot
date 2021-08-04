const CqHttp = require('../service/cqhttp');

module.exports = class HelpHandler {
    async handle(ctx) {
        let args = ctx.args;
        if (args['command'] != null && await bot.imageGenerator.MarkdownFileExist(`help/${args['command']}`)) {
            let image = await bot.imageGenerator.generateFromMarkdownFile(`help/${args['command']}`);
            return CqHttp.imageCQCode(image);
        }
        let image = await bot.imageGenerator.generateFromMarkdownFile('help/help');
        return CqHttp.imageCQCode(image);
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
