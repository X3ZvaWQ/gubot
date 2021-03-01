const ENV = require('../../env.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;

const models = {
  alias : require("../model/alias"),
  user : require('../model/user'),
  group : require('../model/group'),
  team: require('../model/team')
}
for(let i in models){
  models[i].sync({ alter: true });
}