const { htmlToText } = require('html-to-text');

const post = htmlToText('<img src="http://baidu.com/1.jpg"></img>', {
    wordwrap: 130,
    formatters: {
        'imgFormatter': function (elem, walk, builder, formatOptions) {
            const attribs = elem.attribs || {};
            const alt = (attribs.alt)
              ? he.decode(attribs.alt, builder.options.decodeOptions)
              : '';
            const src = (!attribs.src)
              ? ''
              : (formatOptions.baseUrl && attribs.src.indexOf('/') === 0)
                ? formatOptions.baseUrl + attribs.src
                : attribs.src;
            const text = (!src)
              ? alt
              : (!alt)
                ? `[CQ:image,file=${src},type=show,id=40004]`
                : alt + ` [CQ:image,file=${src},type=show,id=40004]`;
          
            builder.addInline(text);
        }
      },
      tags: {
        //[CQ:image,file=http://baidu.com/1.jpg,type=show,id=40004]
        'img': {
          format: 'imgFormatter'
        }
      }
});

console.log(post);