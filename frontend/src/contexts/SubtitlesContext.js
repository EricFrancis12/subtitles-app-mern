import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVideoUpload } from './VideoUploadContext';
import defaultEditorSettings from '../config/defaultEditorSettings.json';

const SubtitlesContext = React.createContext();

export function useSubtitles() {
    return useContext(SubtitlesContext);
}

export function SubtitlesProvider({ children }) {
    const { userClient } = useAuth();
    const { videoFile } = useVideoUpload();

    const [subtitlesData, setSubtitlesData] = useState(null);
    const [numLines, setNumLines] = useState(parseInt(userClient?.defaultEditorSettings?.numLines || defaultEditorSettings.numLines));
    const [numWordsPerLine, setNumWordsPerLine] = useState(parseInt(userClient?.defaultEditorSettings?.numWordsPerLine || defaultEditorSettings.numWordsPerLine));

    useEffect(() => {
        setSubtitlesData(null);
    }, [videoFile?.name]);

    async function transcribeVideo() {
        const formData = new FormData();
        formData.append('videoFile', videoFile);

        return await new Promise((resolve, reject) => {
            fetch('/transcribe', {
                method: 'POST',
                body: formData
            }).then(async (res) => {
                const data = await res.json();

                if (data.success === false) {
                    reject(data);
                }

                if (data.subtitlesData) {
                    setSubtitlesData(data.subtitlesData);
                }

                resolve(data);
            }).catch(err => reject(err));
        });
    }

    const value = {
        subtitlesData,
        setSubtitlesData,
        numLines,
        setNumLines,
        numWordsPerLine,
        setNumWordsPerLine,
        transcribeVideo
    };

    return (
        <SubtitlesContext.Provider value={value}>
            {children}
        </SubtitlesContext.Provider>
    )
}
