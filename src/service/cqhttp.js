const url = require('url');

module.exports = class Cqhttp {
    static sendPrivateMessage(message, user_id) {
        return {
            action: "send_private_msg",
            params: {
                user_id: user_id,
                message: message
            }
        };
    }

    static sendGroupMessage(message, group_id) {
        return {
            action: "send_group_msg",
            params: {
                group_id: group_id,
                message: message
            }
        };
    }

    static setFriendAddRequest(approve, flag) {
        return {
            action: "set_friend_add_request",
            params: {
                flag: flag,
                approve: approve
            }
        }
    }

    static setGroupInviteRequest(approve, flag) {
        return {
            action: "set_group_add_request",
            params: {
                flag: flag,
                sub_type: 'invite',
                approve: approve
            }
        }
    }

    static setGroupAddRequest(approve, flag) {
        return {
            action: "set_group_add_request",
            params: {
                flag: flag,
                sub_type: 'add',
                approve: approve
            }
        }
    }

    static setGroupSpecialTitle(group_id, user_id, special_title) {
        return {
            action: "set_group_special_title",
            params: {
                group_id: group_id,
                user_id: user_id,
                special_title: special_title
            }
        }
    }
    
    static setGroupAdmin(group_id, user_id, enable) {
        return {
            action: "set_group_admin",
            params: {
                group_id: group_id,
                user_id: user_id,
                enable: enable
            }
        }
    }

    static setGroupBan(group_id, user_id, duration) {
        return {
            action: "set_group_ban",
            params: {
                group_id: group_id,
                user_id: user_id,
                duration: duration
            }
        }
    }

    static CQ_image(path) {
        return `[CQ:image,file=${url.pathToFileURL(path)}]`;
    }

    static delayRequest(request, delay) {
        return {
            _delay: delay,
            request: request
        }
    }
}