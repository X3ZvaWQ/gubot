const ENV = require('../../env');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(ENV.db_database, ENV.db_username, ENV.db_password, {
  dialect: ENV.db_dialect,
  host: ENV.db_host,
  port: ENV.db_port
});
global.sequelize = sequelize;
/* 
const Alias = require("./src/model/alias");
const FlowerPrice = require("./src/model/flowerPrice");
const User = require('./src/model/user'); 
*/
const models = {
  alias : require("../model/alias"),
  flowerPrice : require("../model/flowerPrice"),
  user : require('../model/user')
}
for(let i in models){
  models[i].sync({ alter: true });
}