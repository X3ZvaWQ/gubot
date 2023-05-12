const ENV = require('../../env.json').database;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.database, ENV.username, ENV.password, {
  dialect: ENV.dialect,
  host: ENV.host,
  port: ENV.port
});
global.bot = {};
bot.sequelize = sequelize;

const models = {
  alias : require("../model/alias"),
  user : require('../model/user'),
  group : require('../model/group'),
  team: require('../model/team'),
  groupOption: require('../model/botOption'),
  botOption: require('../model/team'),
  bot: require('../model/bot'),
  team: require('../model/team')
}

sequelize.sync({ alter: true });