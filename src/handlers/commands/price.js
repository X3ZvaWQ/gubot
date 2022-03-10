const CqHttp = require('../../service/cqhttp');
const XiaoHei = require('../../service/httpApi/xiaohei');
const moment = require('moment');

module.exports = class PriceHandler {
    name = "Price";

    args = [
        {
            name: 'name',
            alias: 'outward',
            displayName: '外观名称',
            type: 'string',
            limit: null,
            nullable: true,
            default: '狐金'
        },
        {
            name: 'update',
            alias: null,
            displayName: '刷新缓存',
            type: 'boolean',
            limit: null,
            nullable: true,
            default: false
        }
    ];;

    init(registry) {
        registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message.startsWith('物价 ')
        ), this);
    }

    async handle(event) {
        let args = event.args;
        let data = event.data;
        let redis_key = `OutwardPrice_XiaoHei:${args.name}`;
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        if (result == null || args['update'] || !(await fs.access(result))) {
            let outwardId = await XiaoHei.search(args.name);
            let outwardInfo = await XiaoHei.info(outwardId);
            let outwardSeconds = await XiaoHei.seconds(outwardId);
            let templateData = {
                info: outwardInfo,
                data: outwardSeconds,
                timestamps: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')
            };
            result = await bot.imageGenerator.generateFromTemplateFile('outward', templateData, {
                selector: 'body'
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 1800);
        }
        if (data.message_type == 'private') {
            return CqHttp.sendPrivateMessage(CqHttp.CQ_image(result), data.user_id);
        } else {
            return CqHttp.sendGroupMessage(CqHttp.CQ_image(result), data.group_id);
        }
    }
}