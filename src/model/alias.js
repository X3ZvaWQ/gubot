var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = global.sequelize;

class Alias extends Model {
    static async get(alias,scope,group){
        try{
            if(typeof alias == 'string' && scope != 'command') {
                alias = alias.toLowerCase();
            }
            let where = {
                alias: alias,
                scope: scope,
                group: group || '*'
            };
            let where_string = 'Alias:'+JSON.stringify(where);
            let redis_alias = await redis.get(where_string);
            if(redis_alias != null && redis_alias != undefined){
                return redis_alias;
            }else{
                let alias_instance = await Alias.findOne({
                    where : where
                })
                if(alias_instance == null) {
                    if(scope == 'scope'){
                        return null;
                    }else{
                        let real_scope = await Alias.get(scope, 'scope');
                        if(real_scope != null) {
                            let result = await Alias.get(alias, real_scope);
                            await redis.set(where_string, result);
                            return result;
                        }
                        await redis.set(where_string, alias);
                        return alias;
                    }
                }else{
                    await redis.set(where_string, alias_instance.real);
                    return alias_instance.real;
                }
            }
        }catch(e){
            console.log(e);
            return alias;
        }
    }
}

Alias.init({
    real: {
        type: DataTypes.STRING,
    },
    alias: {
        type: DataTypes.STRING,
    },
    scope: {
        type: DataTypes.STRING,
        defaultValue: '*'
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: '*'
    }
}, {
    sequelize,
    modelName: 'Alias',
    tableName: 'alias',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
module.exports = Alias;
