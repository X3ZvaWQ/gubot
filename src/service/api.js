const axios = require('axios');
const md5 = require('js-md5');
const {JSDOM} = require("jsdom");
const jx3api_baseurl = require('../../env.json').jx3api_baseurl;
const ENV = require('../../env.json');
const moment = require('moment');

class Api{
    static async getFlowerPriceFromSpider(params) {
        let result = await axios.get('https://spider.jx3box.com/flower',{
            params: params
        });
        return result.data;
    }
    
    static async getExamAnswer(key) {
        let response = await axios.get(`https://next.jx3box.com/api/exam`,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            },
            params: {
                search: key
            }
        });
        let hits = response.data['hits'];
        let qa = {}
        for (let i in hits) {
            if(i < 5) {
                let options = JSON.parse(hits[i]['_source']['options']);
                let answer = JSON.parse(hits[i]['_source']['answer']);
                qa[hits[i]['_source']['title']] = answer.map(x => options[x]).join(',');
            }
        }
        return qa;
    }
    
    static async getServerListFromJx3Box() {
        let url = 'https://spider.jx3box.com/jx3servers';
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        if(response.data.code != 0) {
            throw `url：https://spider.jx3box.com/jx3servers \n 获取服务器列表失败`;
        }
        let servers = {}
        let datas = response.data.data;
        for(let server of datas){
            servers[server.serverName] = {
                zoneName: server.zoneName,
                serverName: server.serverName,
                ipAddress: server.ipAddress,
                ipPort: server.ipPort,
                mainServer: server.mainServer
            }
        }
        return servers;
    }

    static async getServerStatus(s) {
        let server = s;
        const { Socket } = require('net');
        let connectTest = () => new Promise((resolve, reject) => {
            let socket = new Socket().on('connect', () => {
                socket.destroy();
                resolve('success')
            }).on('error', (e) => {
                socket.destroy();
                resolve('error');
            }).on('timeout', () => {
                socket.destroy();
                resolve('timeout');
            });
            socket.setTimeout(1000);
            socket.connect(server['ipPort'], server['ipAddress']);
        });
        let result = await connectTest();
        if(result == 'success') {
            server.connectState = true;
        }else{
            server.connectState = false;
        }
        server.checkTime = moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss');
        return server;
    }
    
    static async getAchievementSearch(keyword) {
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
    
    static async getAchievementPost(ID) {
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

    static async getSandBox(server){
        let url = `https://www.j3sp.com/`;
        let response = await axios.get(url,{
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        let data = response.data;
        const dom = new JSDOM(data);
        const document = dom.window.document;
        let tr;
        document.querySelectorAll('#myTabContent-time #table tr').forEach(e => {
            let td = e.querySelector('td:nth-of-type(2)');
            if(td && td.innerHTML.trim() == server) tr = e;
        });
        if(!tr) throw -1;
        let area = tr.querySelector('td:nth-of-type(1)').innerHTML.trim();
        server = tr.querySelector('td:nth-of-type(2)').innerHTML.trim();
        let updated_at = tr.querySelector('td:nth-of-type(5)').innerHTML.trim();
        let sandbox_image = tr.querySelector('td:nth-of-type(7)>img').src.trim();
        return [area, server, updated_at, sandbox_image];
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
