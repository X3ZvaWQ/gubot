var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = bot.sequelize;

class Group extends Model {
    
}

Group.init({
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
    server_broadcast:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    serendipity_broadcast:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    meme:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
module.exports = Group;
