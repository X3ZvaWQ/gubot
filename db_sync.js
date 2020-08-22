const Alias = require("./src/model/alias");
const { flowerPrice } = require("./src/route");

Alias.sync();
flowerPrice.sync();