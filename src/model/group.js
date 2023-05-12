const GroupOption = require('./groupOptions');
const Team = require('./team');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const Model = Sequelize.Model;

let sequelize = bot.sequelize;

class Group extends Model {
    async getOption(option) {
        let groupOptions = await this.getOptions();
        for (let groupOption of groupOptions) {
            if (groupOption.option == option) {
                return groupOption.value;
            }
        }
        return null;
    }

    async getUsers() {
        const User = require('./user');
        return User.findAll({
            where: {
                group_id: this.group_id
            }
        })
    }
}

Group.init({
    group_id: {
        type: DataTypes.STRING
    },
    botname: {
        type: DataTypes.STRING,
        defaultValue: '咕咕'
    },
    groupname: {
        type: DataTypes.STRING,
    },
    server: {
        type: DataTypes.STRING,
        defaultValue: '梦江南'
    }
}, {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Group.hasMany(GroupOption, {
    foreignKey: 'group_id',
    as: 'options'
});

Group.hasMany(Team, {
    foreignKey: 'group_id',
    as: 'teams'
});

module.exports = Group;
