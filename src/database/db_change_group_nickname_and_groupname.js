const ENV = require('../../env.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;
const Group = require('../model/group');

groups = Group.findAll().then(x => {
    for(let i in x) {
        let group = x[i];
        let temp = group.groupname;
        group.groupname = group.nickname;
        group.nickname = temp;
        group.save();
    }
});