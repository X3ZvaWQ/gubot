const Cqhttp = require('../../service/cqhttp');
const Logger = require('../../service/logger');

module.exports = class GroupSpecialTitleHandler {
    name = "GroupSpecialTitle";

    args = [{
        name: 'special_title',
        alias: null,
        displayName: '想要的头衔',
        type: 'string',
        limit: {
            min: 1,
            max: 6
        },
        nullable: false,
        default: '-'
    }, {
        name: 'target',
        alias: null,
        displayName: '目标',
        type: 'string',
        limit: null,
        nullable: true,
        default: null
    }];

    init(registry) {
        /* registry.registerHandler((data) => (
            data.post_type == 'message' &&
            data.message_type == 'group' &&
            data.message.startsWith('我要头衔')
        ), this); */
    }

    async handle(event) {
        let args = event.args;
        if(args.target == null) {
            let user = event.user;
            let group = event.group;
            let special_title = args.special_title;
            Logger.info(`${this.name}: allow group [${group.group_id}] special title request by qq user [${user.qq}]`)
            return Cqhttp.setGroupSpecialTitle(group.group_id, user.qq, special_title);
        }else{
            console.log(event);
        }
    }
}