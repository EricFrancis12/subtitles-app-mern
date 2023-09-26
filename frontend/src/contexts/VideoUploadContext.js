import React, { useState, useContext } from 'react';
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

    function handleVideoLoaded(e) {
        const videoElement = e.target;
        console.log(videoElement);
        setVideoInfo(new VideoInfo({ videoFile, videoElement }));
    }

    const value = {
        videoFile,
        setVideoFile,
        handleFileUpload,
        videoInfo,
        setVideoInfo,
        handleVideoLoaded
    };

    return (
        <VideoUploadContext.Provider value={value}>
            {children}
        </VideoUploadContext.Provider>
    )
}
