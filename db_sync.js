const ENV = require('./env');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;

const Alias = require("./src/model/alias");
const FlowerPrice = require("./src/model/flowerPrice");
const User = require('./src/model/user');

Alias.sync({ alter: true });
FlowerPrice.sync({ alter: true });
User.sync({ alter: true });