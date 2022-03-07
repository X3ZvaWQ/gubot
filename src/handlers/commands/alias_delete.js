const CqHttp = require('../../service/cqhttp');
const Alias = require('../../model/alias');

module.exports = class AliasDeleteHandler {
    name = "AliasDelete";

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
            data.message.startsWith('删除别名 ')
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
        if (data.message_type == 'group') {
            where['group'] = `${data.group_id}`;;
        }
        let alias = await Alias.findOne({
            where: where
        });
        if (alias != null) {
            await alias.destroy();
            let reply = `成功：[${where.scope}]作用域下[${where.real}]的别名[${where.alias}]已删除`;
            delete where.real;
            
            console.log(await bot.redis.get('Alias:' + JSON.stringify(where)));
            await bot.redis.del('Alias:' + JSON.stringify(where));
            if (data.message_type == 'group') {
                return CqHttp.sendGroupMessage(reply, data.group_id)
            } else {
                return CqHttp.sendPrivateMessage(reply, data.user_id)
            }
        } else {
            throw '错误：该别名不存在';
        }
    }
}