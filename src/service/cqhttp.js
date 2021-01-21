class Cq{
    static ImageCQCode(src){
        return `[CQ:image,file=${src}]`;
    }

    static AtCQCodeParse(CQCode) {
        let [_, qq] = /qq=(\d+)/.exec(CQCode);
        return qq;
    }
}

module.exports = Cq;