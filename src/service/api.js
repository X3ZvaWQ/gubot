const axios = require('axios');
const md5 = require('js-md5');
const {JSDOM} = require("jsdom");
const jx3api_baseurl = require('../../env.json').jx3api_baseurl;
const ENV = require('../../env.json');
const moment = require('moment');

class Api{
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

    static async getFurnitureFromJx3box(name){
        let url = "https://www.j3pz.com/api/furniture?size=3&page=1"
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                name: name
            }
        });
        try{
            let data = response.data.data;
            if(data.length < 1) {
                throw 'j3pz.furniture接口返回为空，请检查输入的家具是否存在。';
            }
            let result =  {
                time: response.data.time * 1000,
                data: []
            }
            for(let i in data){
                let cur = data[i]['attributes'];
                result.data.push({
                    name: cur.name,
                    geomantic: cur.environment,
                    hard: cur.robustness,
                    view: cur.beauty,
                    practical: cur.practicality,
                    interesting: cur.fun,
                    source: cur.source,
                    quality: cur.level,
                    levelLimit: cur.limit,
                    image_url: `https://dl.pvp.xoyo.com/prod/icons/ui/image/homeland/data/source/${cur.img}`,
                    tip: cur.desc.replace(/\n/g, '<br />')
                });
            }
            return result;
        }catch(e){
            console.log(e);
            throw '调用j3pz.furniture返回值错误，请检查参数是否正确。';
        }
    }

    static async getJx3BoxMenuGroup(){
        let url = `https://helper.jx3box.com/api/menu_groups`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                id: [
                    'guide-pve',
                    'guide-pvx',
                    'guide-pvp',
                    'guide-bps-kungfu',
                    'guide-bps-weapon',
                    'guide-other',
                ],
            }   
        });
        if(data.code == 200){
            let data = response.data.data;
            return data;
        }
    }

    static async getJx3BoxBpsPost(id){
        let url = `https://server.jx3box.com/post/find`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                id: id || "19902",
            }   
        });
        if(data.code == 10064){
            let data = response.data.data;
            return data;
        }
        throw '错误：无法在剑三魔盒上找到该文章'
    }

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
