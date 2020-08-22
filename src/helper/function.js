const shellQuote = require('shell-quote');
const axios = require('axios');

function version() {
    return '1.0.0'
}

function commandParse(context) {
    return shellQuote.parse(context);
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

module.exports = {version, commandParse, getJX3DayStart, getFlowerPriceFromSpider, getExamAnswer}