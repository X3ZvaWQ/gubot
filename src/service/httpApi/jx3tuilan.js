const { $tuilan } = require('./axios');

class Jx3tuilan{
    static apiDisplayName = 'Jx3tuilan';

    static async role_equip(role_id, server, zone){
        
    }

    static async jjc_info(name, server) {
        try {
            let response = await $tuilan.get('/get_role_jjc_info_by_name', {
                params: {
                    name: name,
                    server: server
                }
            });
            if(!response.data || response.data.msg != '查询成功！'){
                throw `错误：[${Jx3tuilan.apiDisplayName}]的接口[jjc_info]返回值异常，请检查参数。`;
            }
            return response.data.data;
        } catch (error) {
            if(error && error.response && error.response.status == 401) {
                throw `错误：找不到该角色数据，请在世界频道发言。`;
            }else{
                throw `错误：[${Jx3tuilan.apiDisplayName}]的接口[jjc_info]炸了，请稍后再试！`;
            }
        }
    }
}

module.exports = Jx3tuilan;