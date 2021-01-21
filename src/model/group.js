var Sequelize = require('sequelize');
var DataTypes = Sequelize.DataTypes;
var Model = Sequelize.Model;

let sequelize = global.sequelize;

class Group extends Model {
    
}

Group.init({
    group_id: {
        type: DataTypes.STRING
    },
    nickname: {
        type: DataTypes.STRING,
    },
    server: {
        type: DataTypes.STRING
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
