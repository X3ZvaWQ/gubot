var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = bot.sequelize;

class Group extends Model {

}

Group.init({
    bot_id: {
        type: DataTypes.STRING
    },
    group_id: {
        type: DataTypes.STRING
    },
    nickname: {
        type: DataTypes.STRING,
        defaultValue: '咕咕'
    },
    groupname: {
        type: DataTypes.STRING,
    },
    server: {
        type: DataTypes.STRING,
        defaultValue: '唯我独尊'
    },
    convenient:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    chat:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    group_serendipity_broadcast:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    news_broadcast:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    server_broadcast:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    serendipity_broadcast:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    meme:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    accept_join_group: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    members: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    bot_voice_type: {
        type: DataTypes.INTEGER,
        defaultValue: 101016
    }
}, {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
module.exports = Group;
