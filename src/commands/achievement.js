const { htmlToText } = require('html-to-text');
const Api = require('../service/api');
const Image = require('../service/image');
const Cq = require('../service/cqhttp');

module.exports = class AchievementHandler{
    async handle(ctx) {
        let args = ctx.state.args;
        let redis_key = `Achievement:${args.achievement}`;
        let context = await redis.get(redis_key);
        let result;
        if(context == null){
            let search = await Api.getAchievementSearch(args.achievement);
            let achievementID;

            if(search.code == 200 && search.data.achievements.length > 0){
                achievementID = search.data.achievements[0].ID;
            }else{
                return 'ERROR: Unknown Achievement!\n错误：没找到这个成就的数据。';
            }
            let id = achievementID;
            let name = search.data.achievements[0].Name;
            let url = `https://www.jx3box.com/cj/#/view/${id}`;
            result = `----${name}成就攻略----
            ${Cq.ImageQrCode(await Image.getFromUrl(url, {selector: 'div.cj-module.m-cj-post', evaluate: 'document.querySelectorAll("#c-header,.c-breadcrumb,.u-publish,.w-qrcode,.remark,.comment").forEach((x) => x.remove());'}))}
            ----------------
            以上内容来源于jx3box。
            需要查看原版可以前往jx3box查看。`.replace(/[ ]{2,}/g,"").replace(/\n[\s\n]+/g,"\n");
            await redis.set(redis_key, result);
            await redis.expire(redis_key, 3600);
        }
        return result;
    }

    static argsList() {
        return [{
            name: 'achievement',
            alias: 'achievement',
            type: 'string',
            defaultIndex: 1,
            shortArgs: null,
            longArgs: 'key',
            limit: null,
            nullable: false
        }];
    }

    static argsMissingError() {
        return this.helpText();
    }

    static helpText() {
        return `成就查询命令，可用命令有成就、cj以及群管理员自定义的别名。接受1个参数
            1.关键字，成就名。
        `.replace(/[ ]{2,}/g,"");
    }
}