const axios = require('axios');
const md5 = require('js-md5');
const ENV = require('../../env.json');

class Api{ 
    static async getChatAnswer(message, session, nickname) {
        let url = 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_textchat';
        let app_id = ENV.tecent_nlp_chat_appid;
        let app_key = ENV.tecent_nlp_chat_appkey;
        message = message.replace(new RegExp(nickname.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '小豪豪');
        let params = {
            app_id: app_id,
            time_stamp: Math.floor(Date.now()/1000),
            nonce_str: `${Math.random()}`,
            session: session,
            question: message,
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
        let response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain'
            },
            params: params
        });
        if(response.data.ret == 0) {
            return response.data.data.answer.replace(/小豪豪/g, nickname);
        }else{
            return null;
        }
    }
}

module.exports = Api;
