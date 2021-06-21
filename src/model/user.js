var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = bot.sequelize;

class User extends Model {
    
}

User.init({
    qq: {
        type: DataTypes.STRING
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: "*"
    },
    nickname: {
        type: DataTypes.STRING
    },
    permissions: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
module.exports = User;
