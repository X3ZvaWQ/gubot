class Cq{
    static ImageQrCode(src){
        return `[CQ:image,file=${src}]`;
    }
}

module.exports = Cq;