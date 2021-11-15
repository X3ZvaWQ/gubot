const { $jx3api } = require('./axios');

class Jx3api{
    static apiDisplayName = 'JX3API';

    static async strengthen(xf) {
        let response = await $jx3api.get('/app/heighten', {params:{
            name: xf || "冰心诀"
        }});
        if(response.data.code == 200) {
            let data = response.data.data.data;
            return {
                增强小药: data.heighten_drug,
                增强小吃: data.heighten_food,
                辅助小药: data.auxiliary_drug,
                辅助小吃: data.auxiliary_food
            }
        }else{
            throw `错误：[${Jx3api.apiDisplayName}]的接口[heighten]返回值异常，请检查参数。`;
        }
    }

    static async gest(xf) {
        let response = await $jx3api.get('/app/matrix', {params:{
            name: xf || "冰心诀"
        }});
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
            throw `错误：[${Jx3api.apiDisplayName}]的接口[matrix]返回值异常，请检查参数。`;
        }
    }

    static async travel(map) {
        let response = await $jx3api.get('/app/travel', {params:{
            map: map || "七秀"
        }});
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
                    geomantic: cur.geomantic_score,
                    hard: cur.hard_score,
                    view: cur.view_score,
                    practical: cur.practical_score,
                    interesting: cur.interesting_score,
                    source: cur.source,
                    quality: cur.quality_level,
                    levelLimit: cur.level_limit,
                    image_url: cur.image_path,
                    tip: cur.tip.replace(/\n/g, '<br />')
                });
            }
            return result;
        }else{
            throw `错误：[${Jx3api.apiDisplayName}]的接口[travel]返回值异常，请检查参数。`;
        }
    }

    static async saohua() {
        let response = await $jx3api.get('/app/random');
        if(response.data.code == 200) {
            let result = response.data.data.text;
            return result;
        }else{
            throw `错误：[${Jx3api.apiDisplayName}]的接口[random]返回值异常。`;
        }
    }

    static async daily(server) {
        let response = await $jx3api.get('/app/daily', {params:{
            server: server || "唯我独尊",
        }});
        if(response.data.code == 200) {
            let data = response.data.data;
            let result = {
                时间: data.date,
                星期: data.week,
                秘境日常: data.dayWar,
                驰援任务: data.dayPublic,
                阵营日常: data.dayCamp,
                美人图: data.dayDraw || '（今天不画）',
                战场首胜: data.dayBattle,
                周常五人本: data.weekFive,
                周常十人本: data.weekTeam,
                周公共日常: data.weekPublic
            };
            return result; 
        }else{
            throw `错误：[${Jx3api.apiDisplayName}]的接口[daily]返回值异常，请检查参数。`;
        }
    }

    static async gold(server){
        let response = await $jx3api.get('/app/gold', {params:{
            server: server || "唯我独尊",
        }});
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
                贴吧: data.data['tieba'],

            }
        }else{
            throw `错误：[${Jx3api.apiDisplayName}]的接口[gold]返回值异常，请检查参数。`;
        }
    }

    static async furniture(name) {
        let response = await $jx3api.get(`/app/furniture`, {params:{
            name: name
        }});
        if (response.data.code == 200) {
            let data = response.data.data;
            return {
                name: data.name,
                geomantic: data.geomantic_score,
                hard: data.hard_score,
                view: data.view_score,
                practical: data.practical_score,
                interesting: data.interesting_score,
                source: data.source,
                quality: data.quality,
                levelLimit: data.level_limit,
                image_url: data.image_path,
                tip: data.tip.replace(/\n/g, '<br />')
            };
        } else {
            throw `错误：[${Jx3api.apiDisplayName}]的接口[furniture]返回异常，请检查参数`;
        }
    }

    static async macro(name) {
        let response = await $jx3api.get('/app/macro', {params:{
            name: name
        }});
        let data = response.data;
        if(data.code != 200) {
            throw `错误：[${Jx3api.apiDisplayName}]的接口[macro]返回异常，请检查参数`;
        }
        data = data.data;
        return {
            name: data.name,
            talents: data.qixue,
            content: data.macro,
            time: data.time
        }
    }

    static async seniority(params) {
        let response = await $jx3api.get(`/app/seniority`, {params: params});
        if (response.data.code == 200) {
            return response.data.data.map((data) => ({
                avatar: `${__dirname}/../../assets/images/school/${data.sect}.png`,
                school: data.sect,
                role: data.role,
                score: data.value,
                server: data.server
            })).slice(0, 25);
        } else {
            throw `错误：[${Jx3api.apiDisplayName}]的接口[seniority]返回异常，请检查参数`;
        }
    }
}

module.exports = Jx3api;