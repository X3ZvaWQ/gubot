const fs = require('fs-extra');
const {v4} = require('uuid');
const uuid = v4;

class Image {
    static async generateFromHtml(html, options){
        if(!options) {
            options = {
                size : [800, 600]
            }
        }
        let htmlname = `${process.cwd()}/storage/html/${uuid()}.html`;
        await fs.outputFile(htmlname, html);
        let url = `file://${htmlname}`;
        const page = await puppeteer.newPage();
        await page.setViewport({
            width: configs['size'][0], 
            height: configs['size'][1]
        });
        await page.goto(url);
        let imagename = `${process.cwd()}/storage/image/${uuid()}.png`;
        await page.screenshot({path: imagename});
        await page.close();
        await fs.unlink(htmlname);
        return imagename;
    }

    static async getFromUrl(url, options){
        options = options || {};
        let configs = {
            size: options['size'] || [800,600],
            selector: options['selector'] || undefined
        }
        const page = await puppeteer.newPage();
        if(!configs['selector']){
            await page.setViewport({
                width: configs['size'][0], 
                height: configs['size'][1]
            });
        }
        await page.goto(url);
        let element = configs['selector'] ? await page.$(configs['selector']): page;
        let imagename = `${process.cwd()}/storage/image/${uuid()}.png`;
        await element.screenshot({path: imagename});
        await page.close();
        return imagename;
    }
}

module.exports = Image;