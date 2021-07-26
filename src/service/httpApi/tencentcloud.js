const ENV = require('../../../env.json');
const tencentcloud = require("tencentcloud-sdk-nodejs");
const TtsClient = tencentcloud.tts.v20190823.Client;
const NlpClient = tencentcloud.nlp.v20190408.Client;

const fs = require('fs-extra');
const uuid = require('uuid').v4;

const ttsClientConfig = {
    credential: {
        secretId: ENV.tecentcloud_secretid,
        secretKey: ENV.tecentcloud_secretkey,
    },
    region: "ap-nanjing",
    profile: {
        httpProfile: {
            endpoint: "tts.tencentcloudapi.com",
        },
    },
};
const nlpClientConfig = {
    credential: {
        secretId: ENV.tecentcloud_secretid,
        secretKey: ENV.tecentcloud_secretkey,
    },
    region: "ap-guangzhou",
    profile: {
        httpProfile: {
            endpoint: "nlp.tencentcloudapi.com",
        },
    },
};
const ttsClient = new TtsClient(ttsClientConfig);
const nlpClient = new NlpClient(nlpClientConfig);

class Tencentcloud {
    static apiDisplayName = 'Tecentcloud';

    static async tts(text, voice) {
        let sessionId = uuid();
        const params = {
            "Text": text,
            "SessionId": sessionId,
            "ModelType": 1,
            "VoiceType": voice || 101016,
            "Codec": "mp3"
        };
        let data = await ttsClient.TextToVoice(params);
        data = Buffer.from(data.Audio, 'base64');
        let filename = `${process.cwd()}/storage/audios/${sessionId}.mp3`;
        await fs.writeFile(filename, data);
        return filename;
    }

    static async chat(message, nickname) {
        const params = {
            Query: message
        }
        let reply = await nlpClient.ChatBot(params);
        return reply.Reply.replace(/小龙女/g, nickname);
    }
}

module.exports = Tencentcloud;