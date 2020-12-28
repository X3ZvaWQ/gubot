const ExamHandler = require('./commands/exam');
const FlowerPriceHandler = require('./commands/flowerPrice');
const GoldPriceHandler = require('./commands/goldPrice');
const HelpHandler = require('./commands/help');
const ServerStatusHandler = require('./commands/serverStatus');
const AchievementHandler = require('./commands/achievement');
const SerendipityHandler = require('./commands/serendipity');
const MacroHandler = require('./commands/macro');

module.exports = {
    flowerPrice: FlowerPriceHandler,
    goldPrice: GoldPriceHandler,
    help: HelpHandler,
    exam: ExamHandler,
    serverStatus: ServerStatusHandler,
    achievement: AchievementHandler,
    serendipity: SerendipityHandler,
    macro: MacroHandler
}