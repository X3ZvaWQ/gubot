const shellQuote = require('shell-quote');
const axios = require('axios');
const md5 = require('js-md5');

function version() {
    return '1.0.0'
}

function commandParse(context) {
    let words = shellQuote.parse(context);
    let command = words.shift().substr(1);
    let defaultArgs = [];
    let longArgs = {};
    let shortArgs = {};
    for(let i = 0; i < words.length; i ++) {
        if(/^\-\-/.test(words[i])) {
            let option = words[i].substr(2);
            if(/^\S+\=\S+/.test(option)){
                let [input, okey, ovalue] = /^(\S+)\=(\S+)/.exec(words[i]);
                longArgs[okey] = ovalue;
            }else{
                longArgs[option] = true;
            };
        }else if(/^\-/.test(words[i])){
            let option = words[i].substr(1);
            shortArgs[option] = true;
        }else{
            defaultArgs.push(words[i]);
        }
    }
    return [command, defaultArgs, shortArgs, longArgs];
}

function getJX3DayStart() {
    let time = new Date();
    if(time.getHours() >= 7) {
        time.setHours(7);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
    }else{
        time.setHours(7);
        time.setDate(time.getDate() - 1);
        time.setMinutes(0);
        time.setSeconds(0);
        time.setMilliseconds(0);
    }
    return time;
}

async function getFlowerPriceFromSpider(params) {
    let result = await axios.get('https://next.jx3box.com/api/flower/price/rank',{
        params: params
    });
    return result;
}

async function getExamAnswer(key) {
    let response = await axios.get(`https://next.jx3box.com/api/exam?search=${encodeURIComponent(key)}`,{
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
        }
    });
    let hits = response.data['hits'];
    let qa = {}
    for (let i in hits) {
        qa[hits[i]['_source']['title']] = hits[i]['_source']['options']
    }
    return qa;
}

async function getGoldPrice() {
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

async function getServerStatus() {
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

async function getAchievementSearch(keyword) {
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

async function getAchievementPost(ID) {
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


module.exports = {version, commandParse, getJX3DayStart, getFlowerPriceFromSpider, getExamAnswer, getGoldPrice, getServerStatus, getAchievementSearch, getAchievementPost}