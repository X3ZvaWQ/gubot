const Alias = require('../model/alias');

module.exports = class AliasHandler{
    async handle(args, data) {
        let time = helper.getJX3DayStart();
        
        let params = {
            action: args[0]            
        }
        if(params.action == 'add') {
            return this.add(args);
        } else if (params.action == 'rm') {
            return this.remove(args);
        }

        return text.replace(/[ ]{2,}/g,"");;
    }

    async add(args) {
        let params = {
            action: args[0],
            scope: args[1],
            real: args[2],
            alias: args[3],
        }

        let alias = await Alias.findOne({
            where: {
                real: params.real,
                alias: params.alias,
                scope: params.scope
            }
        });
        if(alias != null) {
            return 'ERROR: Alias already exists.\n错误：该别名已存在！';
        }
        alias = await Alias.create({
            real: params.real,
            alias: params.alias,
            scope: params.scope
        })
        return `别名已成功创建`;
    }

    async remove(args) {
        let params = {
            action: args[0],
            scope: args[1],
            alias: args[2],
        };

        let alias = await Alias.findOne({
            where: {
                alias: params.alias,
                scope: params.scope
            }
        });

        if (alias != null) {
            alias.destroy();
        }
    }

    static helpText() {
        return `设置别名相关的东西，可以接受3-4个参数
            1.行为，必填参数。可选项为{add:[添加
                2.有效区域/别名类型，必填参数。可选项为{command:命令别名，scope:别名类型别名, server:服务器别名，flower:花别名}
                3.真名，必填参数
                4.别名，必填参数]
            rm:[删除
                2.有效区域/别名类型，同上
                3.别名，必填参数
            ]
            list:[列出
                2.有效区域/别名类型，可选参数。默认全部
                3.别名，可选参数，默认全部
                4.真名，可选参数，默认全部
            ]}
            参数留空请填："*"，如[/bm list server * 唯我独尊]可查询所有唯我独尊服务器的别名
            举例：[/bm add flower 荧光菌 蘑菇]
            即可使用[/hj 蘑菇]来查询荧光菌的价格
        `.replace(/[ ]{2,}/g,"");
    }
}