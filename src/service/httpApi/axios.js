const axios = require('axios');

const {__next, __spider, __helperUrl, __ossRoot, __server} = require('@jx3box/jx3box-common/js/jx3box.json')
const jx3tuilan_baseurl = bot.ENV.jx3tuilan_baseurl;
const jx3api_baseurl = bot.ENV.jx3api_baseurl || 'https://jx3api.com/app';
const xiaohei_url = 'https://www.j3price.top:8088/black-api/api';

const $tuilan = axios.create({
    baseURL: `${jx3tuilan_baseurl}`,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$tuilan = $tuilan;

const $server = axios.create({
    baseURL: `${__server}`,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$server = $server;

const $oss = axios.create({
    baseURL: `${__ossRoot}`,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$oss = $oss;

const $next = axios.create({
    baseURL: `${__next}`,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$next = $next;

const $spider = axios.create({
    baseURL: `${__spider}`,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$spider = $spider;

const $helper = axios.create({
    baseURL: `${__helperUrl}`,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$helper = $helper;

const $jx3api = axios.create({
    baseURL: jx3api_baseurl,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
    }
});
exports.$jx3api = $jx3api;

const $xiaohei = axios.create({
    baseURL: xiaohei_url,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'X-Token': ''
    }
});
exports.$xiaohei = $xiaohei;
