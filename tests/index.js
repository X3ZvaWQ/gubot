const puppeteer = require('puppeteer');
const Image = require('../src/service/image');

(async () => {
  global.puppeteer = await puppeteer.launch();
  await Image.getFromUrl('https://jx3.xoyo.com/launcher/update/latest.html', {selector: 'body div:first-of-type'});
  await global.puppeteer.close();
})();