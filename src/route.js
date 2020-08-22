const ExamHandler = require('./commands/examHandler');
const FlowerPriceHandler = require('./commands/flowerPriceHandler');
const HelpHandler = require('./commands/helpHandler');

module.exports = {
    flowerPrice: FlowerPriceHandler,
    help: HelpHandler,
    exam: ExamHandler
}