import React, { useState, useContext, useEffect } from 'react';
import VideoInfo from '../models/VideoInfo';

const VideoUploadContext = React.createContext();

export function useVideoUpload() {
    return useContext(VideoUploadContext);
}

export function VideoUploadProvider({ children }) {
    const [videoFile, setVideoFile] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);

    async function handleFileUpload(e) {
        if (e?.target?.files?.length > 0) {
            const file = e.target.files[0];
            setVideoFile(file);
        }
    }

    useEffect(() => {
        if (videoFile) {
            const _videoInfo = new VideoInfo({ videoFile });
            _videoInfo.init()
                .then(() => setVideoInfo(_videoInfo));
        }
    }, [videoFile]);

    const value = {
        videoFile,
        setVideoFile,
        handleFileUpload,
        videoInfo,
        setVideoInfo
    };

    return (
        <VideoUploadContext.Provider value={value}>
            {children}
        </VideoUploadContext.Provider>
    )
}
