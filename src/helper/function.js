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

module.exports = {version, commandParse, getJX3DayStart, getFlowerPriceFromSpider}