import React, { useState, useContext, useEffect } from 'react';

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

    class VideoInfo {
        constructor(args) {
            const { videoFile, videoElement } = args;

            if (videoFile) {
                this.name = videoFile.name;
            }

            if (videoElement) {
                this.durSec = videoElement.duration;
                this.durFormatted = formatTime(this.durSec);
            }

            function formatTime(durSec) {
                // change this later to do proper formatting...
                return durSec;
            }
        }
    }

    async function transcribeVideo(formData) {
        console.log(formData);
        return fetch('/transctibe', {
            headers: {

            },
            method: '',
            body: ''
        });
    }

    const value = {
        videoFile,
        setVideoFile,
        handleFileUpload,
        videoInfo,
        setVideoInfo,
        handleVideoLoaded,
        transcribeVideo
    };

    return (
        <VideoUploadContext.Provider value={value}>
            {children}
        </VideoUploadContext.Provider>
    )
}
