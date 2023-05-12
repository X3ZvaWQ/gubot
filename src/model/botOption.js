var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = bot.sequelize;

class BotOption extends Model {

}

BotOption.init({
    option: {
        type: DataTypes.STRING
    },
    value: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'BotOption',
    tableName: 'botOptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BotOption;
