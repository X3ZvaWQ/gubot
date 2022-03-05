var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = bot.sequelize;

class GroupOption extends Model {

}

GroupOption.init({
    option: {
        type: DataTypes.STRING,
    },
    value: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
}, {
    sequelize,
    modelName: 'GroupOption',
    tableName: 'groupOption',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = GroupOption;
