import React, { useState, useEffect } from 'react';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import { useSubtitles } from '../contexts/SubtitlesContext';
import { useEditor } from '../contexts/EditorContext';
import { Navigate } from 'react-router-dom';

export default function Editor() {
    const { videoFile } = useVideoUpload();
    const { subtitlesData } = useSubtitles();
    const { editorSettings, setEditorSettings, applyEditorSettingsGlobally } = useEditor();

    const [subtitles, setSubtitles] = useState([]);

    function calculateSubtitles(editorSettings) {
        // take in the editorSettings, and output an array of subtitles,
        // (per numLines & numWordsPerLine)
        // that will be mapped out into divs on screen
        const result = [];

        // subtitles that do not have properties defined should be given the property of editorSettings

        setSubtitles(result);
    }

    class Subtitles {
        constructor(subtitlesData, editorSettings) {
            const { numLines, numWordsPerLine } = editorSettings;
        }
    }


    useEffect(() => {
        calculateSubtitles(editorSettings);
    }, [editorSettings.numLines, editorSettings.numWordsPerLine]);

    return (
        <>
            {videoFile && subtitlesData
                ? <>
                    <div>
                        {subtitles.map((subtitle, index) => {
                            return (
                                <div key={index}>
                                    {subtitle?.line1 + ' | ' + subtitle?.line2 + ' | ' + subtitle?.line3 + ' | ' + subtitle?.line4}
                                </div>
                            )
                        })}
                    </div>
                    <div>
                        {JSON.stringify(subtitlesData)}
                    </div>
                </>
                : <Navigate to='/app' />}
        </>
    )
}
