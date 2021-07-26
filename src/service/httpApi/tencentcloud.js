const ENV = require('../../../env.json');
const tencentcloud = require("tencentcloud-sdk-nodejs");
const TtsClient = tencentcloud.tts.v20190823.Client;
const fs = require('fs-extra');
const uuid = require('uuid').v4;

const clientConfig = {
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
const client = new TtsClient(clientConfig);

class Tencentcloud{
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
        let data = await client.TextToVoice(params);
        data = Buffer.from(data.Audio, 'base64');
        let filename = `${process.cwd()}/storage/audios/${sessionId}.mp3`;
        await fs.writeFile(filename, data);
        return filename;
    }
}

module.exports = Tencentcloud;