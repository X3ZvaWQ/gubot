const Cq = require("../service/cqhttp");
const Image = require("../service/image");

module.exports = class HelpHandler {
    async handle(ctx) {
        let args = ctx.args;
        if (args['command'] != null && route.commands[args['command']] != undefined) {
            let image = await Image.generateFromMarkdownFile(`help/${args['command']}`);
            return Cq.ImageCQCode('file://' + image);
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
}