const art = require('art-template');
const fs = require('fs-extra');

fs.readFile('/d/workspace/gubot/src/templates/jjc.html').then((source) => {
    fs.readFile('/d/workspace/gubot/tests/data.json').then((data) => {
        data = JSON.parse(data.toString());
        source = source.toString();

        console.log(data);
        let a = art.render(source, {data: data});
        fs.outputFile('./aaaa.html', a);
    });
});

/* const ENV = require('../env.json');
const tencentcloud = require("tencentcloud-sdk-nodejs-nlp")
const NlpClient = tencentcloud.nlp.v20190408.Client;
const uuid = require('uuid').v4;

const clientConfig = {
    credential: {
        secretId: ENV.tecentcloud_secretid,
        secretKey: ENV.tecentcloud_secretkey,
    },
    region: "ap-nanjing",
    profile: {
        signMethod: "HmacSHA256",
        httpProfile: {
            reqMethod: "POST", // 请求方法
            reqTimeout: 30, // 请求超时时间，默认60s
        },
    },
}
const client = new NlpClient(clientConfig);
client.apiVersion = '2019-08-23';
client.TextToVoice = function (text) {
    this.request('TextToVoice', {
        Text: text,
        SessionId: uuid(),
        VoiceType: 101016,
        Codec: 'mp3'
    }, function(x){
        console.log(x);
    })
}
client.TextToVoice("咕咕咕，鸽子飞走啦"); */

/* require('colors');
(async () => {
    const ws = require('../src/service/websocket');
    let w = new ws('ws://192.168.1.139:8890?access_token=pi3.14159')
    setTimeout(async () => {
        let r = await w.request({
            action: 'get_group_list'
        }, (m) => (m.data[0] && m.data[0].group_id != undefined));
        console.log(r);
    }, 1000)
})(); */
/* class A{
    hahaha() {
        console.log(arguments.callee);
    }
}
let a = new A();
a.hahaha(); */

/* (async () => {
    let {default: redis} = await import('async-redis');
    const client = redis.createClient({
        host: 'localhost',
        port: 6379
    });
    client.on("error", function (err) {
        console.log("Redis Error: " + err);
    });
})(); */

/* import ENV from '../env.json';
console.log(ENV);
 */
/* const WebSocket = require('ws');
const wsApi = new WebSocket(`wss://socket.nicemoe.cn`);
wsApi.on('open', () => {
    console.log('INFO: Api WebSocket Server connected.');
});
wsApi.on('message', (message) => {
    console.log(message);
}); */

/* const moment = require('moment');
console.log(moment().locale('zhcn').format('YYYY-MM-DD HH:mm:ss')); */
/* const uuid = require('uuid').v4;
const hmacsha1 = require('hmacsha1');
const axios = require('axios');


let access_key_id = '************';
let access_key_secret = '*************';
let params = {
    AccessKeyId: access_key_id,
    Action: 'CreateToken',
    Version: '2019-02-28',
    Format: 'JSON',
    RegionId: 'cn-shanghai',
    Timestamp: moment().utc().format('YYYY-MM-DD[T]hh:mm:ss[Z]'),
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: uuid(),
    Signature: ''
}
let keys = Object.keys(params).sort();
let str = '';

for(let i in keys){
    let key = keys[i];
    if(params[key] != '') {
        str += `${key}=${encodeURIComponent(params[key])}&`
    }
}
str = `POST&%2F&${encodeURIComponent(str.substr(0, str.length - 1))}`;
let sign = encodeURIComponent(hmacsha1(`${access_key_secret}&`, str));
params.Signature = sign;

console.log(params);

axios.post('http://nls-meta.cn-shanghai.aliyuncs.com/', params).then(x => {
    console.log(x.data);
}).catch((x) => {

    console.log(x);
}) */