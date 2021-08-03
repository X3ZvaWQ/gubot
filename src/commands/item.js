const Jx3box = require('../service/httpApi/jx3box');
const moment = require('moment');
const fs = require('fs-extra');
const {__imgPath, __iconPath} = require('@jx3box/jx3box-common/js/jx3box.json')

module.exports = class ItemHandler {
    //thanks to JX3BOX's filter, 魔盒 yyds!
    static itemFilter = {
        bind: (BindType) => {
            switch (BindType) {
                case 1:
                    return '不绑定';
                case 2:
                    return '装备后绑定';
                case 3 :
                    return '拾取后绑定';
                default:
                    return '未知'
            }
        },
        color: (quality) => {
            switch (quality) {
                case 0:
                    return 'rgb(167,167,167)';
                case 1:
                    return 'rgb(255,255,255)';
                case 2:
                    return 'rgb(0,210,75)';
                case 3 :
                    return 'rgb(0,126,255)';
                case 4:
                    return 'rgb(254,45,254)';
                case 5:
                    return 'rgb(255,165,0)';
                default:
                    return 'rgb(0,0,0)'
            }
        },
        secondFormat: (second) => {
            let day = Math.floor(second / (24 * 3600));
            let hour = Math.floor((second - day * 24 * 3600) / 3600);
            let minute = Math.floor((second - day * 24 * 3600 - hour * 3600) / 60);
            second = second - day * 24 * 3600 - hour * 3600 - minute * 60;

            let output = '';
            if (day) output += day + "天";
            if (hour) output += hour + "小时";
            if (minute) output += minute + "分钟";
            if (second) output += second + "秒";
            return output;
        },
        attributePercent: (type, value) => {
            let label = '';
            value = value ? parseInt(value) : 0;
            switch (type) {
                case 'atAllTypeCriticalStrike':
                case 'atLunarCriticalStrike':
                case 'atMagicCriticalStrike':
                case 'atNeutralCriticalStrike':
                case 'atPhysicsCriticalStrike':
                case 'atPoisonCriticalStrike':
                case 'atSolarAndLunarCriticalStrike':
                case 'atSolarCriticalStrike':
                    label = `+${(value / 35737.5 * 100).toFixed(2)}%`;
                    break;
                case 'atAllTypeCriticalDamagePowerBase':
                case 'atLunarCriticalDamagePowerBase':
                case 'atMagicCriticalDamagePowerBase':
                case 'atNeutralCriticalDamagePowerBase':
                case 'atPhysicsCriticalDamagePowerBase':
                case 'atPoisonCriticalDamagePowerBase':
                case 'atSolarAndLunarCriticalDamagePowerBase':
                case 'atSolarCriticalDamagePowerBase':
                    label = `+${(value / 12506.25 * 100).toFixed(2)}%`;
                    break;
                case 'atToughnessBase':
                    label = `+${(value / 35737.5 * 100).toFixed(2)}% +${(value / 9588.75 * 100).toFixed(2)}%会心减害`;
                    break;
                // 化劲
                case 'atDecriticalDamagePowerBase':
                    label = '';// `+${(value / (5175 + value) * 100).toFixed(2)}%`;
                    break;
                case 'atAllTypeHitValue':
                case 'atLunarHitValue':
                case 'atMagicHitValue':
                case 'atNeutralHitValue':
                case 'atPhysicsHitValue':
                case 'atPoisonHitValue':
                case 'atSolarAndLunarHitValue':
                case 'atSolarHitValue':
                    label = `+${(value / 25991.25 * 100).toFixed(2)}%`;
                    break;
                // 闪避
                case 'atDodge':
                    label = '';// `+${(value / (17355 + value) * 100).toFixed(2)}%`;
                    break;
                // 招架
                case 'atParryBase':
                    label = '';// `+${(value / (16293.75 + value) * 100).toFixed(2)}%`;
                    break;
                case 'atStrainBase':
                    label = `+${(value / 34458.75 * 100).toFixed(2)}%`;
                    break;
                case 'atPhysicsDefenceAdd':
                case 'atPhysicsShieldAdditional':
                case 'atPhysicsShieldBase':
                    label = '';// `+${(value / (19091.25 + value) * 100).toFixed(2)}%`;
                    break;
                case 'atLunarMagicShieldBase':
                case 'atMagicShield':
                case 'atNeutralMagicShieldBase':
                case 'atPoisonMagicShieldBase':
                case 'atSolarMagicShieldBase':
                    label = '';// `+${(value / (19091.25 + value) * 100).toFixed(2)}%`;
                    break;
                case 'atLunarOvercomeBase':
                case 'atMagicOvercome':
                case 'atNeutralOvercomeBase':
                case 'atPhysicsOvercomeBase':
                case 'atPoisonOvercomeBase':
                case 'atSolarAndLunarOvercomeBase':
                case 'atSolarOvercomeBase':
                    label = `+${(value / 35737.5 * 100).toFixed(2)}%`;
                    break;
                case 'atHasteBase':
                    label = `+${(value / 43856.25 * 100).toFixed(2)}%`;
                    break;
                default:
                    break;
            }
            return label ? ` (${label})` : '';
        },
        iconUrl: (icon_id) => {
            if (isNaN(parseInt(icon_id))) {
                return `${__imgPath}image/common/nullicon.png`;
            } else {
                return `${__iconPath}icon/${icon_id}.png`;
            }
        },
        itemPrice: (Price) => {
            let zhuan = parseInt(Price / 100 / 100 / 10000);
            let jin = parseInt(Price / 100 / 100 % 10000);
            let yin = parseInt(Price / 100 % 100);
            let tong = parseInt(Price % 100);

            let output = '';
            if (zhuan) output += zhuan + '砖';
            if (jin) output += jin + '金';
            if (yin) output += yin + '银';
            output += tong + '铜';

            return output;
        },
        formatPrice: (Price) => {
            let zhuan = parseInt(Price / 100 / 100 / 10000);
            let jin = parseInt(Price / 100 / 100 % 10000);
            let yin = parseInt(Price / 100 % 100);
            let tong = parseInt(Price % 100);
            const img_asset = __dirname + '/../assets/images/price'
            let result = '';
            if(zhuan > 0) {
                result += `${zhuan} <img src="${img_asset}/zhuan.png"/>`;
            }
            if(jin > 0) {
                result += `${jin} <img src="${img_asset}/jin.png"/>`;
            }
            if(yin > 0) {
                result += `${yin} <img src="${img_asset}/yin.png"/>`;
            }
            if(tong > 0) {
                result += `${tong} <img src="${img_asset}/tong.png"/>`;
            }
            return result;
        }
    }
    async handle(ctx) {
        //get args from state
        let args = ctx.args;
        let redis_key = JSON.stringify('Trade:' + JSON.stringify(args));
        //get data from redis
        let result = await bot.redis.get(redis_key);
        //check data is empty?
        if (result == null || !await fs.exists(result) || args['update']) {
            //判断输入的物品是不是id，否则搜索
            let searchResult = null;
            let itemId;
            if(!/\d_[\d_]+/.exec(args.item)) {
                searchResult = await Jx3box.itemSearch(args.item);
                itemId = searchResult[0].id;
            }else{
                itemId = args.item;
            }
            let prices = await Jx3box.itemPrices(itemId, args.server);
            let item = await Jx3box.itemInfo(itemId);
            let renderData = {
                time: moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss'),
                searchKey: args,
                searchResult: searchResult,
                item: item,
                prices: prices,
                filters: ItemHandler.itemFilter
            };
            result = await bot.imageGenerator.generateFromTemplateFile('item', renderData, {
                selector: 'body > div'
            });
            await bot.redis.set(redis_key, result);
            await bot.redis.expire(redis_key, 300);
        }
        return `[CQ:image,file=file://${platform}${result}]`;
    }

    static argsList() {
        return [
            {
                name: 'item',
                alias: 'item',
                displayName: '物品名',
                type: 'string',
                defaultIndex: 1,
                shortArgs: null,
                longArgs: 'item',
                limit: null,
                nullable: false,
                default: null
            },
            {
                name: 'server',
                alias: 'server',
                displayName: '服务器',
                type: 'server',
                defaultIndex: 2,
                shortArgs: null,
                longArgs: 'map',
                limit: null,
                nullable: true,
                default: '-'
            },
            {
                name: 'update',
                alias: null,
                displayName: '刷新缓存',
                type: 'boolean',
                defaultIndex: 3,
                shortArgs: 'u',
                longArgs: 'update',
                limit: null,
                nullable: true,
                default: false
            }
        ];
    }
}
