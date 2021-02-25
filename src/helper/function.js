const axios = require('axios');
const md5 = require('js-md5');

function version() {
    return '1.0.0'
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

module.exports = {version, getJX3DayStart}