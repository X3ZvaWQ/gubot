const ENV = require('../../env.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.database, ENV.username, ENV.password, {
  dialect: ENV.dialect,
  host: ENV.host,
  port: ENV.port
});
global.bot = {};
bot.sequelize = sequelize;
const Group = require('../model/group');

groups = Group.findAll().then(x => {
    for(let i in x) {
        let group = x[i];
        group.groupname = group.nickname;
        group.nickname = '咕咕';
        group.save();
    }
});