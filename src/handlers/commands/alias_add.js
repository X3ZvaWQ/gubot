const CqHttp = require('../../service/cqhttp');
const Alias = require('../../model/alias');

module.exports = class AliasAddHandler {
    name = "AliasAdd";

    args = [{
        name: 'real',
        alias: null,
        displayName: '真实名称',
        type: 'string',
        limit: null,
        nullable: false,
        default: null
    }, {
        name: 'alias',
        alias: null,
        displayName: '别名',
        type: 'string',
        limit: null,
        nullable: true,
        default: false
    }, {
        name: 'scope',
        alias: null,
        displayName: '别名作用域',
        type: 'string',
        limit: null,
        nullable: false,
        default: null
    },];

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message.startsWith('添加别名 ')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let user = event.user;
        let data = event.data;
        if (user.power < 4096) {
            throw `错误：权限不足，需要权限${4096}，你的权限${user.power}。`;
        }
        if (args.alias == args.real) {
            throw '错误：不可以套娃哦！'
        }
        let where = {
            real: args.real,
            alias: args.alias,
            scope: args.scope,
            group: '*'
        };
        if (data.message_type == 'group')
            where['group'] = `${data.group_id}`;

        let alias = await Alias.findOne({
            where: where
        });
        if (alias != null) {
            throw '错误：该别名已存在！';
        }
        alias = await Alias.create(where)
        let reply = `成功：别名已成功创建,现在[${where.scope}]作用域下的[${where.alias}]会被认为是[${where.real}]`;
        delete where.real;
        await bot.redis.del('Alias:' + JSON.stringify(where));
        if (data.message_type == 'group') {
            return CqHttp.sendGroupMessage(reply, data.group_id)
        } else {
            return CqHttp.sendPrivateMessage(reply, data.user_id)
        }
    }
}