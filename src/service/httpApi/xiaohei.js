const { $xiaohei } = require('./axios');

class XiaoHei{
    static apiDisplayName = '剑网3物价小黑API';

    static async search(outwardName) {
        let response = await $xiaohei.post('/outward/search', {}, {
            params: {
                step: 0,
                page: 1,
                size: 1,
                name: outwardName
            }
        });
        if(response.data.state != 0){
            throw `错误: API未能找到${outwardName}的数据`;
        }
        let outWardList = response.data.data.list;
        //只返回一个结果
        if(outWardList.length == 1) {
            return outWardList[0].id;
        }
        //返回第一个结果但是完全符合
        if(outWardList[0].outwardName == outwardName || outWardList[0].outwardAlias == outwardName) {
            return outWardList[0].id;
        }
        //返回多个结果没有完全符合的
        throw `提示：${outWardList.map((outward) => outward.outwardName).join('|')}`
    }

    static async seconds(outwardId){
        const regions = {
            1: '电信点卡区',
            2: '双线一区',
            3: '电信一区',
            4: '双线二区',
            5: '双线四区'
        };
        let datas = [];
        for(let i in regions) {
            datas.push({
                region: regions[i],
                data: await XiaoHei.second(outwardId, parseInt(i))
            })
        }
        return datas;
    }

    static async second(outwardId, regionId) {
        let response = await $xiaohei.post('/common/search/index/outward/second', {}, {
            params: {
                page: 1,
                limit: 5,
                regionId: regionId,
                outwardId: outwardId
            }
        });
        let prices = response.data.data.prices;
        return prices.map((price) => ({
            price: price.price,
            server: price.server,
            saleCode: price.saleCode,
            date: `20${price.tradeTime}`.replace(/\//g, '-')
        }));
    }

    static async info(outwardId) {
        let response = await $xiaohei.post('/common/search/index/outward', {}, {
            params: {
                imageLimit: 1,
                regionId: 1,
                outwardId: outwardId
            }
        });
        let data = response.data.data;
        return {
            name: data.name,
            alias: data.name1,
            image: data.images[0] ? data.images[0].image : '',
            desc: data.info
        }
    }
}

module.exports = XiaoHei;