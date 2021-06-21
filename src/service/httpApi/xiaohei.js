const { Axios } = require('axios');

class XiaoHei{
    constructor() {
        this.axiosInstance = Axios.create({
            baseURL: 'https://www.j3price.top:8088/black-api/api',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'X-Token': ''
            }
        });
    }

    async search(outwardName) {
        let response = await this.axiosInstance.post('/outward/search', {
            data: {
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

    async seconds(outwardId){
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
                data: await this.second(outwardId, parseInt(i))
            })
        }
        return datas;
    }

    async second(outwardId, regionId) {
        let response = await this.axiosInstance.post('/common/search/index/outward/second', {
            data: {
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

    async info(outwardId) {
        let response = await this.axiosInstance.post('/common/search/index/outward', {
            data: {
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