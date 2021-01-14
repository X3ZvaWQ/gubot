class Cq{
    static ImageQrCode(src){
        return `[CQ:image,file=file://${src}]`;
    }
}

module.exports = Cq;