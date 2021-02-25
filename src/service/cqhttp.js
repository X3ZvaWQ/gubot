class Cq{
    static ImageCQCode(src){
        return `[CQ:image,file=${src}]`;
    }

    static AtCQCodeParse(CQCode) {
        let [_, qq] = /qq=(\d+)/.exec(CQCode);
        return qq;
    }

    async static sendPrivateMessage() {

    }

    async static sendGroupMessage() {

    }

    async static agreeFriendRequest() {

    }

    async static agreeGroupInviteRequest() {

    }
}

module.exports = Cq;