const {$next, $helper, $spider, $oss} = require('./axios');

class Jx3box{
    static apiDisplayName = 'JX3BOX';
    
    static async flower(params) {
        let response = await $spider.get('/flower', params);
        if(response.data.code == 200) {
            if (JSON.stringify(response.data.data) == '{}') {
                throw `错误：[${Jx3box.apiDisplayName}]的接口[spider/flower]返回值异常，请检查参数。`;
            }
            let result = response.data.data
            if(result == undefined || result.length < 1) {
                throw `错误：[${Jx3box.apiDisplayName}]的接口[spider/flower]返回为空，请检查参数。`;
            }
            return result;
        }else{
            throw `错误：[${Jx3box.apiDisplayName}]的接口[spider/flower]返回为空，请检查参数。`;
        }
    }

    static async exam(key) {
        let response = $next.get('/api/exam', {
            search: key
        })
        let hits = response.data['hits'];
        let qa = {}
        for (let i in hits) {
            if(i < 5) {
                let options = JSON.parse(hits[i]['_source']['options']);
                let answer = JSON.parse(hits[i]['_source']['answer']);
                qa[hits[i]['_source']['title']] = answer.map(x => options[x]).join(',');
            }
            break;
        }
        return qa;
    }

    static async servers() {
        let response = $spider.get('/jx3servers')
        if(response.data.code != 0) {
            throw `错误：[${Jx3box.apiDisplayName}]的接口[spider/jx3servers]调用异常，无法获取服务器列表。`;
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

    static async achievementSearch(keyword) {
        let response = $helper.get('/api/achievement/search', {
            limit: 3,
            keyword: keyword
        })
        if (response.data.code == 200 && response.data.data.achievements.length > 0) {
            return response.data.data.achievements[0].ID;
        } else {
            throw `错误：[${Jx3box.apiDisplayName}]的接口[helper/achievement/search]返回为空，请确定成就是否存在`;
        }
    }

    static async achievementPost(ID) {
        let response = $helper.get(`/api/achievement/${ID}/post`);
        let data = response.data;
        return data;
    }

    static async serendipity(params) {
        let response = $next.get(`/api/serendipity`, Object.assign({
            start: 0,
            pageIndex: 1,
            pageSize: 10
        }, params));
        if (response.data.code == 0) {
            return response.data.data.data;
        } else {
            throw `错误：[${Jx3box.apiDisplayName}]的接口[next/serendipity]返回异常，请检查参数`;
        }
    }
}

module.exports = Jx3box;