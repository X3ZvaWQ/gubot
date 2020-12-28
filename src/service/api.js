const axios = require('axios');
const md5 = require('js-md5');

class Api{
    static async getFlowerPriceFromSpider(params) {
        let result = await axios.get('https://next.jx3box.com/api/flower/price/rank',{
            params: params
        });
        return result;
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
            qa[hits[i]['_source']['title']] = hits[i]['_source']['options']
        }
        return qa;
    }
    
    static async getGoldPrice() {
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
}

module.exports = Api;
