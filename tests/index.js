const moment = require('moment');
const uuid = require('uuid').v4;
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
})