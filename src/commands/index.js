const ExamHandler = require('./exam');
const FlowerPriceHandler = require('./flowerPrice');
const GoldPriceHandler = require('./goldPrice');
const HelpHandler = require('./help');
const ServerStatusHandler = require('./serverStatus');
const AchievementHandler = require('./achievement');
const SerendipityHandler = require('./serendipity');
const MacroHandler = require('./macro');
const GameUpdate = require('./gameUpdate');
const SandBoxHandler = require('./sandbox');
const PermissionHandler = require('./permission');
const TeamHandler = require('./team');
const GroupHandler = require('./group');
const AliasHandler = require('./alias');

module.exports = {
    flowerPrice: FlowerPriceHandler,
    goldPrice: GoldPriceHandler,
    help: HelpHandler,
    exam: ExamHandler,
    serverStatus: ServerStatusHandler,
    achievement: AchievementHandler,
    serendipity: SerendipityHandler,
    macro: MacroHandler,
    gameUpdate: GameUpdate,
    sandbox: SandBoxHandler,
    permission: PermissionHandler,
    team: TeamHandler,
    group: GroupHandler,
    alias: AliasHandler
}