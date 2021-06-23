const axios = require('axios');

class Jx3api{
    constructor() {
        this.apiDisplayName = 'JX3API';
        this.baseURL = bot.ENV.jx3api_baseurl || 'https://jx3api.com/app';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
            }
        });
    }

    async strengthen(xf) {
        let response = await this.axiosInstance.get('/strengthen', {
            name: xf || "冰心诀"
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            return {
                增强小药: data.heightenDrug,
                增强小吃: data.heightenFood,
                辅助小药: data.auxiliaryDrug,
                辅助小吃: data.auxiliaryFood
            }
        }else{
            throw `错误：[${this.apiDisplayName}]的接口[strengthen]返回值异常，请检查参数。`;
        }
    }

    async gest(xf) {
        let response = await this.axiosInstance.get('/gest', {
            name: xf || "冰心诀"
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            return {
                name: data.name,
                time: response.data.time * 1000,
                eye: data.skillName,
                一重粗识: data.descs[0].desc,
                二重略懂: data.descs[1].desc,
                三重巧熟: data.descs[2].desc,
                四重精妙: data.descs[3].desc,
                五重游刃: data.descs[4].desc, 
                六重忘我: data.descs[5].desc,
                七重归一: '空'
            }
        }else{
            throw `错误：[${this.apiDisplayName}]的接口[gest]返回值异常，请检查参数。`;
        }
    }

    async travel(map) {
        let response = await this.axiosInstance.get('/travel', {
            name: map || "七秀"
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            let result =  {
                time: response.data.time * 1000,
                data: []
            }
            for(let i in data){
                let cur = data[i];
                result.data.push({
                    name: cur.name,
                    geomantic: cur.geomanticScore,
                    hard: cur.hardScore,
                    view: cur.viewScore,
                    practical: cur.practicalScore,
                    interesting: cur.interestingScore,
                    source: cur.source,
                    quality: cur.qualityLevel,
                    levelLimit: cur.levelLimit,
                    image_url: cur.imagePath,
                    tip: cur.tip.replace(/\n/g, '<br />')
                });
            }
            return result;
        }else{
            throw `错误：[${this.apiDisplayName}]的接口[travel]返回值异常，请检查参数。`;
        }
    }

    async saohua() {
        let response = await this.axiosInstance.get('/random');
        if(response.data.code == 200) {
            let result = response.data.data.text;
            return result;
        }else{
            throw `错误：[${this.apiDisplayName}]的接口[random]返回值异常。`;
        }
    }

    async daily(server) {
        let response = await this.axiosInstance.get('/daily', {
            server: server || "唯我独尊",
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            let result = {
                时间: data.DateTime,
                星期: data.Week,
                秘境日常: data.DayWar,
                驰援任务: data.DayCommon,
                阵营日常: data.DayCamp,
                美人图: data.DayDraw || '（今天不画）',
                战场首胜: data.DayBattle,
                周常五人本: data.WeekFive,
                周常十人本: data.WeekTeam,
                周公共日常: data.WeekCommon
            };
            return result; 
        }else{
            throw `错误：[${this.apiDisplayName}]的接口[daily]返回值异常，请检查参数。`;
        }
    }

    async gold(server){
        let response = await this.axiosInstance.get('/gold', {
            server: server || "唯我独尊",
        });
        if(response.data.code == 200) {
            let data = response.data;
            return {
                time: data.time * 1000,
                server: data.data.server,
                5173: data.data['5173'],
                7881: data.data['7881'],
                dd373: data.data['dd373'],
                uu898: data.data['uu898'],
                万宝楼: data.data['wanbaolou'],
                游募: data.data['youmu']
            }
        }else{
            throw `错误：[${this.apiDisplayName}]的接口[gold]返回值异常，请检查参数。`;
        }
    }
}

module.exports = Jx3api;