const User = require('../model/user');

module.exports = async (ctx, next) => {
    const data = ctx.request.body;
    if(data.message_type == 'private') {
        let user = await User.findOne({
            where: {
                qq: data.user_id,
                group: "*"
            }
        })
        if(user != null) {
            ctx.state.permissions = user.permissions;
        }else{
            ctx.state.permissions = -1;
        }
    }else if(data.message_type == 'group') {
        let user = await User.findOne({
            where: {
                qq: data.user_id,
                group: data.group_id
            }
        })
        if(user != null) {
            ctx.state.permissions = user.permissions;
        }else{
            ctx.state.permissions = -1;
        }
    }else {
        ctx.state.permissions = -1;
    }
    await next();
}