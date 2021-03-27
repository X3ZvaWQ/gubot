/* let q1 = /(\S+)宏/;
let q2 = new RegExp('^([\\S\\s]+)\\s?(攻略|成就)$');
let str = '阴阳两界成就 ';
console.log(q2.test(str), str.replace(q2, '\n$1,$2,$3,$4')); */

/* const {Socket} = require('net');
server = {
    'ipPort': 80,
    'ipAddress': 'baidu.com'
}
let connectTest = () => new Promise((resolve, reject) => {
    let socket = new Socket().on('connect', () => {
        socket.destroy();
        resolve('success')
    }).on('error', (e) => {
        socket.destroy();
        reject('error');
    }).on('timeout', () => {
        socket.destroy();
        reject('timeout');
    });
    socket.connect(server['ipPort'], server['ipAddress']);
}); */
/* new Promise(connectTest).then((x) => {
    console.log(x);
}).catch((e) => {
    console.log(e);
}); *//* 
(async () => {
    let x = await connectTest();
    console.log(x);
})(); */
/* const fs = require('fs-extra');

let content = fs.readJson('/d/workspace/gubot/src/assets/json/servers.json').then(
    (c) => {
        
        let servers = {};
        for(let i in c) {
            delete c[i]['connectState'];
            servers[c[i]['serverName']] = c[i];
        }
        fs.outputJson('/d/workspace/gubot/src/assets/json/servers1.json', servers);
    }
);
 */
/* const { Socket } = require('net');
let socket = new Socket().on('connect', () => {
    console.log('connected');
}).on('error', (e) => {
    console.log(`error: ${e.message}`);
}).on('timeout', () => {
    console.log('timeout');
});
socket.connect(process.argv[2], process.argv[3]);
 */

const axios = require('axios');
const md5 = require('js-md5');
let url = 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat';
let app_key = 'ZKHU1KDsGQD15zgb';
let params = {
    app_id: '2167071591',
    time_stamp: Math.floor(Date.now()/1000),
    nonce_str: `20e3408a79`,
    session: '3303928580',
    question: '小豪豪是谁啊？',
    sign: ''
}
let keys = Object.keys(params).sort();
let str = '';

for(let i in keys){
    let key = keys[i];
    if(params[key] != '') {
        str += `${key}=${encodeURIComponent(params[key])}&`
    }
}
str += `app_key=${app_key}`
let sign = md5(str).toUpperCase();
params.sign = sign;
console.log(params);

axios.get(url, {
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain'
    },
    params: params
}).then((response) => {
    let data = response.data;
    console.log(data);
})


/* const axios = require('axios');
async function getOutwardFromXiaoHei(id){
    let image_url = `https://www.j3price.top:8088/black-api/api/common/search/index/outward`;
    let image_response = await axios.post(image_url, null, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
            'Accept': 'application/json, text/plain, *',
            'X-Token': ''
        },
        params: {
            imageLimit: 1,
            outwardId: 552,
            regionId: 1
        }
    });
    let image_data = image_response.data.data;
    let info = {
        name: image_data.name,
        alias: image_data.name1,
        image: image_data.images[0].image,
        desc: image_data.info
    }
    let data_url = 'https://www.j3price.top:8088/black-api/api/common/search/index/outward/second'
    let regions = {
        1: '电信点卡区',
        2: '双线一区',
        3: '电信一区',
        4: '双线二区',
        5: '双线四区'
    }
    let datas = [];
    for(let i in regions) {
        let data = {
            region: regions[i],
            data: []
        }
        let response = await axios.post(data_url, null, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, *',
                'X-Token': ''
            },
            params: {
                page: 1,
                limit: 5,
                regionId: parseInt(i),
                outwardId: id
            }  
        })
        for(let j in response.data.data.prices) {
            let cur = response.data.data.prices[j];
            data.data.push({
                price: cur.price,
                server: cur.server,
                date: `20${cur.tradeTime}`.replace('/', '-').replace('/', '-'),
                saleCode: cur.saleCode
            });
        }
        datas.push(data);
    }
    return {
        info: info,
        data: datas
    }
}

getOutwardFromXiaoHei(552)
.then((x) => console.log(x))
.catch((error) => {
    console.log(error);
    return error;
}); */