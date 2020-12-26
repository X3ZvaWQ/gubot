const ExamHandler = require('./commands/examHandler');
const FlowerPriceHandler = require('./commands/flowerPriceHandler');
const GoldPriceHandler = require('./commands/goldPriceHandler');
const HelpHandler = require('./commands/helpHandler');
const ServerStatusHandler = require('./commands/serverStatusHandler');

module.exports = {
    flowerPrice: FlowerPriceHandler,
    goldPrice: GoldPriceHandler,
    help: HelpHandler,
    exam: ExamHandler,
    serverStatus: ServerStatusHandler
}