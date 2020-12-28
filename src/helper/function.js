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

module.exports = {version, commandParse, getJX3DayStart}