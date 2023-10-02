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
        this.backgroundColor = options?.backgroundColor || userClient?.defaultEditorSettings?.backgroundColor || defaultEditorSettings.backgroundColor;
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

    createDialogueLine() {
        return [
            '0,',
            `${formatTime(this.startSec)},`,
            `${formatTime(this.endSec)},`,
            `Default,`,
            ',',
            '0,',
            '0,',
            '0,',
            ',',
            formatText(this.lines)
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

        function formatText(lines) {
            return lines.map((line, _index) => {
                const { text, dataset } = parseHtmlString(line);
                const { font, fontSize, fontColor, borderW, borderColor, backgroundColor, positionX, positionY, bold, italic, underline, align } = dataset;

                return [
                    '{',
                    `\\fn${font}`,
                    `\\fs${fontSize}`,
                    `\\c&H${fontColor}`,
                    `\\bord${borderW}`,
                    `\\3c&H${borderColor}`,
                    // backgroundColor?
                    `\\pos(${formatPos(positionX, positionY)})`,
                    bold ? '\\b1$' : '',
                    italic ? '\\i1' : '',
                    underline ? '\\u1' : '',
                    // align?
                    '}',
                    text,
                    '{\\r}',
                    _index + 1 === lines.length ? '' : '\\N'
                ].join('');
            }).join('');

            function formatPos(positionX, positionY) {
                // ...
            }
        }
    }
}



Subtitle.makeSubtitlesFile = function (props) {
    const { subtitles, videoInfo, styles } = props;
    const { height, width } = videoInfo;
    const { font, fontSize, fontColor, bold, italic, underline,  } = styles;

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();

    

    let result = [
        '[Script Info]',
        `; Created on ${month}-${day}-${year}`,
        'WrapStyle: 1',
        'ScaledBorderAndShadow: yes',
        `PlayResX: ${width}`,
        `PlayResY: ${height}`,
        '',
        '[V4+ Styles]',
        'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
        '',
        `Style: Default,${font},${fontSize},${fontColor},&H000000FF,&H80000000,&H80000000,${bold},${italic},${underline},${def.Strikeout},${def.ScaleX},${def.ScaleY},${def.Spacing},${def.Angle},${def.BorderStyle},${def.Outline},${def.Shadow},${def.Alignment},${def.MarginL},${def.MarginR},${def.MarginV},${def.Encoding}`,
        '',
        '[Events]',
        'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
        ''
    ].join('\n');

    subtitles.forEach(subtitle => {
        result += subtitle.createDialogueLine();
    });

    return result;
}
