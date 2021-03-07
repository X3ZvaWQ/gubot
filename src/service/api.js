const axios = require('axios');
const md5 = require('js-md5');
const {JSDOM} = require("jsdom");

class Api{
    static async getFlowerPriceFromSpider(params) {
        let result = await axios.get('https://spider.jx3box.com/flower',{
            params: params
        });
        console.log(params);
        return result.data;
    }
    
    static async getExamAnswer(key) {
        let response = await axios.get(`https://next.jx3box.com/api/exam`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                search: key
            }
        });
        let hits = response.data['hits'];
        let qa = {}
        for (let i in hits) {
            let options = JSON.parse(hits[i]['_source']['options']);
            let answer = JSON.parse(hits[i]['_source']['answer']);
            qa[hits[i]['_source']['title']] = answer.map(x => options[x]).join(',');
        }
        return qa;
    }
    
    static async getGoldPriceFromJx3Api(server) {
        let priceUrl = "https://nico.nicemoe.cn/app/getGold";
        let response = await axios.get(priceUrl,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                server: server
            }
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
            console.log(response);
            throw `调用jx3api.getGold返回值错误`;
        }
    }

    static async getGoldPriceFromArkwish() {
        let priceUrl = "https://box.arkwish.com/api/gold";
        // 准备参数
        let ts = Math.round(new Date().getTime() / 1000);
        let access_token = md5(`${ts}secret`);
        let params = {
            ts: ts,
            access_token: access_token,
        };
        let response = await axios.get(priceUrl,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });
        let data = response.data;
        return data;
    }
    
    static async getServerStatus() {
        let url = 'https://spider.jx3box.com/jx3servers';
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        let data = response.data;
        return data;
    }
    
    static async getAchievementSearch(keyword) {
        let url = "https://helper.jx3box.com/api/achievement/search";
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                limit: 3,
                keyword: keyword
            }
        });
        let data = response.data;
        return data;
    }
    
    static async getAchievementPost(ID) {
        let url = `https://helper.jx3box.com/api/achievement/${ID}/post`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        let data = response.data;
        return data;
    }

    static async getSerendipity(args){
        let url = `https://next.jx3box.com/api/serendipity`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: args
        });
        let data = response.data;
        return data;
    }

    static async getMacroTops(kungfuid){
        let url = `https://next.jx3box.com/api/macro/tops`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                kungfu: kungfuid,
                size: 10
            }
        });
        let data = response.data;
        return data;
    }

    static async getMacroContent(pid){
        let url = `https://server.jx3box.com/post/find`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                id: pid
            }
        });
        let data = response.data;
        return data;
    }

    static async getQiXue(version){
        version = version || 'v20201030';
        let url = `https://oss.jx3box.com/data/qixue/${version}.json`
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        let data = response.data;
        return data;
    }

    static async getSandBox(server){
        let url = `https://www.j3sp.com/`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        let data = response.data;
        const dom = new JSDOM(data);
        const document = dom.window.document;
        let tr;
        document.querySelectorAll('#myTabContent-time #table tr').forEach(e => {
            let td = e.querySelector('td:nth-of-type(2)');
            if(td && td.innerHTML.trim() == server) tr = e;
        });
        if(!tr) throw -1;
        let area = tr.querySelector('td:nth-of-type(1)').innerHTML.trim();
        server = tr.querySelector('td:nth-of-type(2)').innerHTML.trim();
        let updated_at = tr.querySelector('td:nth-of-type(5)').innerHTML.trim();
        let sandbox_image = tr.querySelector('td:nth-of-type(7)>img').src.trim();
        return [area, server, updated_at, sandbox_image];
    }

    static async getDailyFromJx3Api(server){
        let url = `https://nico.nicemoe.cn/app/getDaily`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                server: server || "唯我独尊",
            }
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            return {
                时间: data.Date,
                星期: data.Week,
                秘境日常: data.DayWar,
                驰援任务: data.DayCommon,
                战场首胜: data.DayBattle,
                周常五人本: data.WeekFive,
                周常十人本: data.WeekTeam,
                周公共日常: data.WeekCommon
            }
        }else{
            throw `调用jx3api.getDaily返回值错误`;
        }
    }

    static async getReinforcementFromJx3Api(xf){
        let url = `https://nico.nicemoe.cn/app/getHeighten`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                name: xf || "冰心诀"
            }   
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            return {
                增强小药: data.HeightenDrug,
                增强小吃: data.HeightenFood,
                辅助小药: data.AuxiliaryDrug,
                辅助小吃: data.AuxiliaryFood
            }
        }else{
            throw `调用jx3api.getHeighten返回值错误`;
        }
    }
    
    static async getEyeFromJx3Api(xf){
        let url = `https://nico.nicemoe.cn/app/getFormation`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                name: xf || "冰心诀"
            }   
        });
        if(response.data.code == 200) {
            let data = response.data.data;
            return {
                name: data.name,
                time: response.data.time * 1000,
                eye: data.eye,
                一重粗识: data.one,
                二重略懂: data.two,
                三重巧熟: data.three,
                四重精妙: data.four,
                五重游刃: data.five, 
                六重忘我: data.six,
                七重归一: '空'
            }
        }else{
            throw `调用jx3api.getHeighten返回值错误`;
        }
    }

    static async getJx3BoxMenuGroup(){
        let url = `https://helper.jx3box.com/api/menu_groups`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                id: [
                    'guide-pve',
                    'guide-pvx',
                    'guide-pvp',
                    'guide-bps-kungfu',
                    'guide-bps-weapon',
                    'guide-other',
                ],
            }   
        });
        if(data.code == 200){
            let data = response.data.data;
            return data;
        }
    }

    static async getJx3BoxBpsPost(id){
        let url = `https://server.jx3box.com/post/find`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                id: id || "19902",
            }   
        });
        if(data.code == 10064){
            let data = response.data.data;
            return data;
        }
        throw '错误：无法在剑三魔盒上找到该文章'
    }
}

module.exports = Api;
