const ENV = require('./env');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;

const Alias = require("./src/model/alias");
const flowerPrice = require("./src/model/flowerPrice");

Alias.sync();
flowerPrice.sync();