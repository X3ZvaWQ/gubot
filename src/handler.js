const Logger = require('./service/logger')
const CqHttp = require('./service/cqhttp');
const Injector = require('./injector');
const requireAll = require('require-all');

module.exports = class EventHandler {
    matcherList = [];

    constructor() {
        let handlersMap = requireAll(`${__dirname}/handlers`);
        this.traverseHandlersMap(handlersMap);
    }

    traverseHandlersMap(handlers) {
        for (let name in handlers) {
            if (typeof handlers[name] == 'function') {
                const inst = new handlers[name]();
                inst.init(this);
            } else {
                this.traverseHandlersMap(handlers[name]);
            }
        }
    }

    registerHandler(matcher, handler) {
        this.matcherList.push({
            match: matcher,
            handler: handler
        });
        Logger.info(`Handler: Event Handler [${handler.name || handler}] register success.`)
    }

    async handle(data, ws) {
        if (typeof data == 'string') data = JSON.parse(data);
        let resultSet = [];
        for (let matcher of this.matcherList) {
            try {
                if (matcher.match(data)) {
                    let event = {
                        data: data,
                        type: data.post_type,
                        group: null,
                        user: null,
                        bot: null
                    }
                    if(ws.bot) event.bot = ws.bot;

                    let handler = matcher.handler;
                    await (new Injector(event, handler)).inject();
                    let result = await handler.handle(event);
                    if(result) {
                        if (typeof result == 'array') {
                            resultSet.push(...result);
                        } else {
                            resultSet.push(result);
                        }
                    }
                }
            } catch (e) {
                if (typeof e == 'string') {
                    if (data.post_type == 'message' && data.message_type == 'private') {
                        resultSet.push(CqHttp.sendPrivateMessage(e, data.user_id));
                    } else if (data.post_type == 'message' && data.message_type == 'group') {
                        resultSet.push(CqHttp.sendGroupMessage(e, data.group_id));
                    }
                }else{
                    Logger.warn(`handle event error! \nEvent data:${JSON.stringify(data, null, 4)}\nException: ${e.stack || e}`);
                }
            }
        }
        return resultSet;
    }
}