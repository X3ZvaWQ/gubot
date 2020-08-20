const FlowerPrice = require('../model/flowerPrice');
const Alias = require('../model/alias');

module.exports = class FlowerPriceHandler{
    async handle(args) {
        let time = helper.getJX3DayStart();
        
        let params = {
            flower: args[0] ? await Alias.get(args[0], 'flower') : '绣球花',
            server: args[1] ? await Alias.get(args[1], 'server') : '唯我独尊',
            map: args[2] ? await Alias.get(args[2], 'map') : '广陵邑'
        }
        console.log(params);
        let flowerPrice = await FlowerPrice.findOne({
            where: {
                server: params.server,
                map: params.map,
                flower: params.flower,
                date: time
            }
        })
        if(flowerPrice == null) {
            let response = await helper.getFlowerPriceFromSpider(params);
            let data = response.data;
            if(JSON.stringify(data) != '{}') {
                flowerPrice = await FlowerPrice.create({
                    server: params.server,
                    map: params.map,
                    flower: params.flower,
                    date: time,
                    data: JSON.stringify(data)
                });
            }else{
                return 'ERROR: Empty Response.'
            }
        }

        let text = '------------------\n';
        let price = JSON.parse(flowerPrice.data);
        for(let i in price) {
            let lines = price[i]['maxLine'].slice(0,3).join(',');
            text = text + `${params.server}·${i}·${params.map}·最高${price[i]['max']}家园币\n线路：${lines}\n日期：${flowerPrice.date}\n------------------\n`
        }
        return text;
    }

    static helpText() {
        return `
            花价查询命令，可用命令有flower、花价、hj以及群管理员自定义的别名。可接受0~3个参数\n
            1.花的种类，可为空，默认为绣球花\n
            2.服务器，可为空，默认为唯我独尊\n
            3.地图，可为空，默认为广陵邑
        `
    }
}