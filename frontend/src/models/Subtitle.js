import defaultEditorSettings from '../config/defaultEditorSettings.json';
import { highest, mean } from '../utils/utils';
import { parseHtmlString } from '../components/VideoPlayer';

export default class Subtitle {
    constructor(props) {
        const { options, userClient } = props;

        this.lines = options?.lines || [];
        this.index = undefined;

        this.startSec = options?.startSec || null;
        this.endSec = options?.endSec || null;
        this.confidence = options?.confidence || null;

        this.font = options?.font || userClient?.defaultEditorSettings?.font || defaultEditorSettings.font;
        this.fontSize = options?.fontSize || userClient?.defaultEditorSettings?.fontSize || defaultEditorSettings.fontSize;
        this.fontColor = options?.fontColor || userClient?.defaultEditorSettings?.fontColor || defaultEditorSettings.fontColor;
        this.borderW = options?.borderW || userClient?.defaultEditorSettings?.borderW || defaultEditorSettings.borderW;
        this.borderColor = options?.borderColor || userClient?.defaultEditorSettings?.borderColor || defaultEditorSettings.borderColor;
        this.positionX = options?.positionX || userClient?.defaultEditorSettings?.positionX || defaultEditorSettings.positionX;
        this.positionY = options?.positionY || userClient?.defaultEditorSettings?.positionY || defaultEditorSettings.positionY;
        this.bold = options?.bold || userClient?.defaultEditorSettings?.bold || defaultEditorSettings.bold;
        this.italic = options?.italic || userClient?.defaultEditorSettings?.italic || defaultEditorSettings.italic;
        this.underline = options?.underline || userClient?.defaultEditorSettings?.underline || defaultEditorSettings.underline;
        this.align = options?.align || userClient?.defaultEditorSettings?.align || defaultEditorSettings.align;
    }

    fill(subtitlesData, numLines, numWordsPerLine, i = 0) {
        this.lines = [];

        this.startSec = subtitlesData.words[i].startSec;

        const confidenceValues = [];

        for (let j = 1; j <= numLines; j++) {
            let result = '';
            for (let k = 1; k <= numWordsPerLine; k++) {
                result += subtitlesData.words[i]?.word || '';

                if (subtitlesData.words[i]?.confidence) {
                    confidenceValues.push(subtitlesData.words[i]?.confidence);
                }

                if (k < numWordsPerLine) {
                    result += ' ';
                }

                if (k <= numWordsPerLine) {
                    i++;
                }
            }
            this.lines.push(result);
        }

        while (this.lines.at(-1) === '') {
            this.lines.pop(); // chop-off excess lines that are ecactly empty strings
        }

        this.endSec = subtitlesData.words[i - 1]?.endSec || subtitlesData.words.at(-1).endSec;

        // To represent confidence, there are 2 options: highest and mean
        // (each with functions imported above)
        // The API returns a confidence value from 0 to 1 FOR EACH WORD TRANSCRIBED.
        // That means if we have a subtitle containing multiple words,
        // we get to choose how to show the combined confidence to the user:
        // (1) highest value out of all of them.
        // OR
        // (2) take the mean.
        this.confidence = mean(confidenceValues);

        return i - 1;
    }

    createDialogueLine(globalStyles) {
        return [
            'Dialogue: ',
            '0,',
            `${formatTime(this.startSec)},`,
            `${formatTime(this.endSec)},`,
            `Default,`,
            ',',
            '0,',
            '0,',
            '0,',
            ',',
            formatText(this, globalStyles)
        ].join('');

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            let formattedHours = hours.toString().padStart(1, '0');
            let remainingMinutes = (minutes % 60);
            let remainingSeconds = (seconds % 60).toFixed(2);

            // making sure no negatives:
            if (formattedHours < 0) formattedHours = 0;
            if (remainingMinutes < 0) remainingMinutes = 0;
            if (remainingSeconds < 0) remainingSeconds = 0;

            if (remainingSeconds < 10) remainingSeconds = `0${remainingSeconds}`;
            if (remainingMinutes < 10) remainingMinutes = `0${remainingMinutes}`;
            return `${formattedHours}:${remainingMinutes}:${remainingSeconds}`;
        }

        function formatText(props, globalStyles) {
            const { lines, align, positionX, positionY } = props;

            return lines.map((line, _index) => {
                const { text, dataset } = parseHtmlString(line);

                let alignment = '';
                switch (align) {
                    case 'left': alignment = '4'; break;
                    case 'center': alignment = '5'; break;
                    case 'right': alignment = '6'; break;
                }

                const font = dataset.font ?? globalStyles.font ?? '';
                const fontSize = dataset.fontSize ?? globalStyles.fontSize ?? '';
                const fontColor = dataset.fontColor ?? globalStyles.fontColor ?? '';
                const borderW = dataset.borderW ?? globalStyles.borderW ?? '';
                const borderColor = dataset.borderColor ?? globalStyles.borderColor ?? '';
                const bold = dataset.bold ?? globalStyles.bold ?? '';
                const italic = dataset.italic ?? globalStyles.italic ?? '';
                const underline = dataset.underline ?? globalStyles.underline ?? '';

                return [
                    '{',
                    `\\pos(${formatPos(positionX)},${formatPos(positionY)})`,
                    `\\an${alignment}`,
                    `\\fn${font}`,
                    `\\fs${fontSize}`,
                    `\\c&H${fontColor}`,
                    `\\bord${borderW}`,
                    `\\3c&H${borderColor}`,
                    bold ? '\\b1$' : '',
                    italic ? '\\i1' : '',
                    underline ? '\\u1' : '',
                    '}',
                    text,
                    '{\\r}',
                    _index === lines.length - 1 ? '' : '\\N'
                ].join('');
            }).join('');

            function formatPos(position) {
                // Change this later, because this is not accurate.
                // It should calculate position based on how ffmpeg burns them in - not exactly sure how it works yet...
                // Need to test.
                return position;
            }
        }
    }
}



Subtitle.makeSubtitlesFile = function (props) {
    const { subtitles, videoInfo, globalStyles } = props;
    const { height, width } = videoInfo;
    const { font, fontSize, fontColor, bold, italic, underline, } = globalStyles;

    console.log(globalStyles);

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    // 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    // `Style: Default,${font},${fontSize},${fontColor},&H000000FF,&H80000000,&H80000000,${bold},${italic},${underline},${def.Strikeout},${def.ScaleX},${def.ScaleY},${def.Spacing},${def.Angle},${def.BorderStyle},${def.Outline},${def.Shadow},${def.Alignment},${def.MarginL},${def.MarginR},${def.MarginV},${def.Encoding}`,

    const headerStyles = [
        { Format: 'Name', Style: 'Default' },
        { Format: 'Fontname', Style: font.value },
        { Format: 'Fontsize', Style: fontSize.value },
        { Format: 'PrimaryColour', Style: `&H00${fontColor.value}` },
        { Format: 'SecondaryColour', Style: '&H000000FF' },
        { Format: 'TertiaryColour', Style: '&H80000000' },
        { Format: 'BackColour', Style: '&H80000000' },
        { Format: 'Bold', Style: bold.value === true ? '1' : '0' },
        { Format: 'Italic', Style: italic.value === true ? '1' : '0' },
        { Format: 'Underline', Style: underline.value === true ? '1' : '0' },
        { Format: 'StrikeOut', Style: '0' },
        { Format: 'ScaleX', Style: '100' },
        { Format: 'ScaleY', Style: '100' },
        { Format: 'Spacing', Style: '0' },
        { Format: 'Angle', Style: '0' },
        { Format: 'BorderStyle', Style: '1' },
        { Format: 'Outline', Style: '2' },
        { Format: 'Shadow', Style: '0' },
        { Format: 'Alignment', Style: '5' },
        { Format: 'MarginL', Style: '30' },
        { Format: 'MarginR', Style: '30' },
        { Format: 'MarginV', Style: '10' },
        { Format: 'Encoding', Style: '1' }
    ];

    return [
        '[Script Info]',
        `; Created on ${month}-${day}-${year}`,
        'WrapStyle: 1',
        'ScaledBorderAndShadow: yes',
        `PlayResX: ${width}`,
        `PlayResY: ${height}`,
        '',
        '[V4+ Styles]',
        `Format: ${headerStyles.map(item => item.Format).join(', ')}`,
        '',
        `Style: ${headerStyles.map(item => item.Style).join(', ')}`,
        '',
        '[Events]',
        'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
        '',
        subtitles.map(subtitle => subtitle.createDialogueLine()).join('')
    ].join('\n');
}
