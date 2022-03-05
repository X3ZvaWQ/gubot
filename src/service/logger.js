const colors = require('colors');
const moment = require('moment');

class Logger {
    static warpMessage(message, type) {
        type = type || 'info';
        //message = typeof message == 'object' ? JSON.stringify(message, null, 4) : message;
        message = `[${moment().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss')}][${type.toUpperCase().padStart(7)}]${message}`;
        if (type == 'verbose') message = message.gray;
        if (type == 'info') message = message.white
        if (type == 'success') message = message.green;
        if (type == 'warn') message = message.yellow;
        if (type == 'error') message = message.red;
        return message;
    }

    static log(message, type) {
        if(typeof message == 'string') {
            Logger.output(Logger.warpMessage(message, type));
        }else{
            Logger.output(message);
        }
    }

    static verbose(message) {
        Logger.log(message, 'verbose');
    }
    static info(message) {
        Logger.log(message, 'info');
    }
    static success(message) {
        Logger.log(message, 'success');
    }
    static warn(message) {
        Logger.log(message, 'warn');
    }
    static error(message) {
        Logger.log(message, 'error');
    }
    static output(content) {
        console.log(content);
    }
}

module.exports = Logger;