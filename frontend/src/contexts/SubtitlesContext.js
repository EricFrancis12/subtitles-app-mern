import React, { useState, useContext, useEffect } from 'react';
import { useVideoUpload } from './VideoUploadContext';

const SubtitlesContext = React.createContext();

export function useSubtitles() {
    return useContext(SubtitlesContext);
}

export function SubtitlesProvider({ children }) {
    const [subtitlesData, setSubtitlesData] = useState(null);

    const { videoFile } = useVideoUpload();

    useEffect(() => {
        console.log('running setSubtitlesData() because videoFile.name changed');
        setSubtitlesData(null)
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
        transcribeVideo
    };

    return (
        <SubtitlesContext.Provider value={value}>
            {children}
        </SubtitlesContext.Provider>
    )
}
