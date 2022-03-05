//该类型负责向事件实例注入必要的数据以供事件处理器使用
module.exports = class Injector {
    constructor(event, handler) {
        this.event = event;
        this.handler = handler;
    }

    async inject() {
        await this.injectModel();
        if (this.isMessage()) {
            let argsList = this.handler.args;
            let args = await this.argsParse(argsList);
            this.event['args'] = args;
        }
    }

    isMessage() {
        if (this.event.data
            && this.event.data.post_type == 'message') {
            return true;
        }
    }

    isGroupMessage() {
        if (this.event.data
            && this.event.data.post_type == 'message'
            && this.event.data.message_type == 'group') {
            return true;
        }
    }

    async injectModel() {
        let data = this.event.data;
        let bot = this.event.bot;
        if (data.group_id && bot) {
            const User = require('./model/user');
            const Group = require('./model/group');
            let group = (await Group.findOrCreate({
                where: {
                    group_id: data.group_id,
                    bot_id: bot.id
                },
                defaults: {
                    groupname: data.group_id,
                    group_id: data.group_id,
                    bot_id: bot.id
                }
            }))[0];
            this.event.group = group;
            if (group) {
                let user = (await User.findOrCreate({
                    where: {
                        qq: data.user_id,
                        group: data.group_id
                    }
                }))[0];
                this.event.user = user;
            }
        } else if (data.user_id) {
            let user = await User.findOrCreate({
                where: {
                    qq: data.user_id,
                    group: "*"
                }
            });
            this.event.user = user;
        }
    }

    async argsParse(argsList) {
        const yargs_parser = require('yargs-parser');
        const Alias = require('./model/alias');
        let event = this.event;
        const getArg = async (arg, allArgs, index) => {
            let value = undefined;
            value = allArgs[index];
            if (value == undefined || value == null || value == '-') {
                if (arg.nullable) {
                    value = arg.default;
                } else {
                    throw `Error: ${arg.displayName || arg.name || ''} 必填参数缺失，请使用/help命令查看命令用法`;
                }
            }
            if (arg.type == 'server' && value == '-') {
                if (event.group) {
                    value = group.server;
                } else {
                    value = '梦江南'
                }
            }
            if (arg.alias != null && value != null) {
                let _value = value;
                if (event.group) {
                    value = await Alias.get(value, arg.alias, event.group.group_id);
                }
                if (value == _value) value = await Alias.get(value, arg.alias, '*');
            }
            if (arg.limit instanceof Object && arg.type == 'integer') {
                if (value < arg.limit.min || value > arg.limit.max) {
                    throw `错误: ${arg.displayName || arg.name || ''} 参数不符合规范，参数要求取值范围[${arg.limit.min}, ${arg.limit.max}](闭区间)\n请使用 /help 命令查看命令用法`;
                }
            }
            if (arg.limit instanceof Array && arg.type == 'string') {
                if (arg.limit.indexOf(`${value}`) == -1) {
                    throw `错误: ${arg.displayName || arg.name || ''} 参数不符合规范，参数要求取值为{${arg.limit.join(',')}}中的一个, 你输入了[${value}]\n请使用 /help 命令查看命令用法`;
                }
            }
            if (arg.limit && arg.limit.min != undefined && arg.limit.max != undefined && arg.type == 'string') {
                if (typeof value != 'string' || value.length < arg.limit.min || value.length > arg.limit.max) {
                    throw `错误: ${arg.displayName || arg.name || ''} 参数不符合规范，参数要求字符串长度在[${arg.limit.min},${arg.limit.max}](闭区间)之间\n请使用 /help 命令查看命令用法`;
                }
            }
            return value;
        }

        let args = {};
        let allArgs = yargs_parser(this.event.data.message)['_'].slice(1);
        if (argsList instanceof Array) {
            try {
                for (let i in argsList) {
                    let value = await getArg(argsList[i], allArgs, i);
                    args[argsList[i].name] = value;
                }
            } catch (e) {
                throw e;
            }
        } else if (argsList instanceof Object) {
            try {
                let action = await getArg(argsList.actions, allArgs, 0);
                args[argsList.action.name] = action;
                let branchArgsList = argsList.branchs[action];
                allArgs = allArgs.slice(1);
                for (let i in branchArgsList) {
                    let value = await getArg(branchArgsList[i], allArgs, i);
                    args[branchArgsList[i].name] = value;
                }
            } catch (e) {
                throw e;
            }
        }
        return args;
    }
}