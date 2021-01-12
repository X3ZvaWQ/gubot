const puppeteer = require('puppeteer');
 
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('file:///d/workspace/gubot/storage/html/index.html');
  await page.screenshot({path: '/c/Users/X3ZvaWQ/Desktop/asasa.png'});
 
  await browser.close();
})();