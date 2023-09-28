import defaultEditorSettings from '../config/defaultEditorSettings.json';
import { highest, mean } from '../utils/utils';

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
}
