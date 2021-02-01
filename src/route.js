const ExamHandler = require('./commands/exam');
const FlowerPriceHandler = require('./commands/flowerPrice');
const GoldPriceHandler = require('./commands/goldPrice');
const HelpHandler = require('./commands/help');
const ServerStatusHandler = require('./commands/serverStatus');
const AchievementHandler = require('./commands/achievement');
const SerendipityHandler = require('./commands/serendipity');
const MacroHandler = require('./commands/macro');
const GameUpdate = require('./commands/gameUpdate');
const SandBoxHandler = require('./commands/sandbox');
const PermissionHandler = require('./commands/permission');
const TeamHandler = require('./commands/team');
const GroupHandler = require('./commands/group');
const AliasHandler = require('./commands/alias');

module.exports = {
    commands: {
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
    
}