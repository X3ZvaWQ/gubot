const { htmlToText } = require('html-to-text');

const post = htmlToText('<a href="http://baidu.com/1.jpg" >哈哈哈哈</a>', {
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
        },
        'aFormatter': function (elem, walk, builder, formatOptions) {
            walk(elem.children, builder)
            builder.addInline('[这里有一个链接,但是你得去网页上点]');
        }
      },
      tags: {
        //[CQ:image,file=http://baidu.com/1.jpg,type=show,id=40004]
        'img': {
          format: 'imgFormatter'
        },
        'a': {
            format: 'aFormatter'
        }
      }
});

console.log(post);