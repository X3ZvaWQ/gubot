var Sequelize = require('sequelize');
const BotOption = require('./botOption');
const Group = require('./group');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = bot.sequelize;

class Bot extends Model {
    async getOption(option) {
        let botOptions = await this.getOptions();
        for(let botOption of botOptions){
            if(botOption.option == option) {
                return botOption.value;
            }
        }
        return null;
    }
}

Bot.init({
    self_id: {
        type: DataTypes.STRING
    },
    nickname: {
        type: DataTypes.STRING,
        defaultValue: '咕咕'
    },
    admin: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
}, {
    sequelize,
    modelName: 'Bot',
    tableName: 'bots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Bot.hasMany(Group, {
    foreignKey: 'bot_id',
    as: 'groups'
});

Bot.hasMany(BotOption, {
    foreignKey: 'bot_id',
    as: 'options'
});

module.exports = Bot;
