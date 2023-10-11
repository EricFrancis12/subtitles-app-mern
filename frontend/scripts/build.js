const fs = require('fs');
const path = require('path');

const ffmpegFonts = require('../src/config/ffmpegFonts.json');



(function writeFontCssFile() {
    let fontCssFileData = '';

    ffmpegFonts.forEach(font => {
        fontCssFileData += [
            `@font-face {`,
            `\tfont-family: '${font.family}';`,
            `\tsrc: url('../fonts/${font.fileName}') format('${font.format}');`,
            `}`,
            ``,
            ``
        ].join('\n');
    });

    const fontCssFilePath = '../src/assets/css/ffmpegFonts.css';
    fs.writeFileSync(path.resolve(__dirname, fontCssFilePath), fontCssFileData, { encoding: 'utf8' });
})();
