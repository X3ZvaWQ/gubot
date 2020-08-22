var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = global.sequelize;

class Alias extends Model {
    static async get(alias,scope){
        let alias_instance = await Alias.findOne({
            where : {
                alias: alias,
                scope: scope
            }
        })
        if(alias_instance == null) {
            if(scope == 'scope'){
                return null;
            }else{
                let real_scope = await Alias.get(scope, 'scope');
                if(real_scope == null) {
                    return alias;
                }
                let result = await Alias.get(alias, real_scope);
                return result;
            }
        }else{
            return alias_instance.real;
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
        type: DataTypes.STRING
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
