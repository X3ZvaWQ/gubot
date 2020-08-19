const FlowerPrice = require('../model/flowerPrice');

module.exports = class FlowerPriceHandler{
    async handle(args) {
        let time = helper.getJX3DayStart();
        let params = {
            flower: args[0] || '绣球花',
            server: args[1] || '唯我独尊',
            map: args[2] || '广陵邑'
        }
        let flowrPrice = await FlowerPrice.findOne({
            where: {
                server: params.server,
                map: params.map,
                flower: params.flower,
                date: time
            }
        })
        if(flowrPrice != null) {
            return flowrPrice.data;
        }else{
            let response = await helper.getFlowerPriceFromSpider(params);
            let data = response.data;
            let flowrPrice = await FlowerPrice.create({
                server: params.server,
                map: params.map,
                flower: params.flower,
                date: time,
                data: JSON.stringify(data)
            });
            return flowrPrice.data;
        }
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