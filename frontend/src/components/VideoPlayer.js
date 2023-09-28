import React, { useState, useEffect, useRef } from 'react';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import useDragger from '../hooks/useDragger';
import { isEmpty } from '../utils/utils';

const SUBTITLE_OVERLAY_LINE = 'SUBTITLE_OVERLAY_LINE';
const VIDEO_BUTTON_OPTIONS = { PLAY: 'PLAY', PAUSE: 'PAUSE' };
const VIDEO_UPDATE_RATE_MS = 100;

export default function VideoPlayer(props) {
    const { subtitles, setSubtitles, videoTimeSec, setVideoTimeSec, selectionScope, handleSubtitleClick } = props;

    const { videoFile } = useVideoUpload();

    const [videoSrc, setVideoSrc] = useState('');
    const [videoButton, setVideoButton] = useState(VIDEO_BUTTON_OPTIONS.PLAY);
    const [videoInterval, setVideoInterval] = useState(null);
    const [subtitleOverlay, setSubtitleOverlay] = useState(null);

    const videoRef = useRef();
    const subtitleOverlayRef = useRef();
    const inputClicked = useRef(null)

    useDragger('subtitle-overlay', draggerCallback);

    function draggerCallback(coords) {
        const { lastX, lastY } = coords;
        console.log(coords);
        console.log(subtitleOverlay);
        const index = subtitleOverlay.index;

        const newSubtitles = [...subtitles];
        // newSubtitles[index].lines = [...newSubtitles[index].lines];
        newSubtitles[index].positionX = lastX;
        newSubtitles[index].positionY = lastY;

        setSubtitles(newSubtitles);

        setTimeout(() => console.log(subtitles), 0);
    }

    function handleVideoButtonClick() {
        if (videoButton === VIDEO_BUTTON_OPTIONS.PLAY) {
            videoRef.current.play();

            const interval = setInterval(() => {
                setVideoTimeSec(videoRef.current.currentTime);
            }, VIDEO_UPDATE_RATE_MS);
            setVideoInterval(interval);

            setVideoButton(VIDEO_BUTTON_OPTIONS.PAUSE);
        } else {
            videoRef.current.pause();

            clearInterval(videoInterval);
            setVideoInterval(null);

            setVideoButton(VIDEO_BUTTON_OPTIONS.PLAY);
        }
    }

    useEffect(() => {
        if (videoFile) {
            const videoURL = URL.createObjectURL(videoFile);
            setVideoSrc(videoURL);
        }
    }, [videoFile]);

    useEffect(() => {
        const currentSubtitle = binarySearchForSubtitle(subtitles, videoTimeSec);
        setSubtitleOverlay(currentSubtitle);
    }, [videoTimeSec, subtitles]);

    function binarySearchForSubtitle(subtitles, videoTimeSec) {
        for (let i = 0; i < subtitles.length; i++) {
            subtitles[i].index = i; // Initialize the index property
        }

        let left = 0;
        let right = subtitles.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const subtitle = subtitles[mid];

            if (subtitle.startSec <= videoTimeSec && subtitle.endSec >= videoTimeSec) {
                return subtitle; // Found a matching subtitle
            } else if (subtitle.endSec < videoTimeSec) {
                left = mid + 1; // Search the right half
            } else {
                right = mid - 1; // Search the left half
            }
        }

        return null;
    }

    useEffect(() => {
        subtitleOverlayRef.current.addEventListener('click', handleClick);

        return () => {
            if (subtitleOverlayRef.current) subtitleOverlayRef.current.removeEventListener('click', handleClick);
        }

        function handleClick(e) {
            const index = parseInt(e.target?.dataset?.index);
            if (!isEmpty(index) && index !== NaN) handleSubtitleClick(index, 2);

            if (e.target === inputClicked.current) {
                inputClicked.current.dataset.selectionscope = '2';
            } else if (!inputClicked.current && e.target.classList.contains(SUBTITLE_OVERLAY_LINE)) {
                inputClicked.current = e.target;
            } else {
                if (inputClicked.current) inputClicked.current.dataset.selectionscope = '1';
                inputClicked.current = null;
            }
        }
    }, []);

    function updateLine(e) {
        const index = parseInt(e.target.dataset.index);
        const line = parseInt(e.target.dataset.line);

        const newSubtitles = [...subtitles];
        newSubtitles[index].lines = [...newSubtitles[index].lines];
        newSubtitles[index].lines[line - 1] = e.target.value;
        setSubtitles(newSubtitles);
    }

    return (
        <div>
            <div>
                <div>
                    <div className='position-relative bg-primary overflow-hidden' style={{ height: '400px', width: '400px' }}>
                        <div id='subtitle-overlay' ref={subtitleOverlayRef} className='position-absolute border border-black' style={{ cursor: 'pointer', zIndex: '10' }}>
                            {subtitleOverlay?.lines?.map((line, _index) => {
                                return (
                                    <input key={_index}
                                        readOnly={selectionScope < 2 ? true : false}
                                        value={line}
                                        onChange={e => updateLine(e)}
                                        className={SUBTITLE_OVERLAY_LINE + ' '}
                                        style={{ display: 'block', textAlign: subtitleOverlay.align ?? '', cursor: 'pointer' }}
                                        data-selectionscope='1' data-index={subtitleOverlay.index} data-line={_index + 1}>
                                    </input>
                                )
                            })}
                        </div>
                        <video src={videoSrc} ref={videoRef} className='h-100 w-100'></video>
                    </div>
                </div>
                <div>
                    <button data-selectionscope='1'
                        onClick={e => handleVideoButtonClick()}>{videoButton === VIDEO_BUTTON_OPTIONS.PLAY ? 'Play' : videoButton === VIDEO_BUTTON_OPTIONS.PAUSE ? 'Pause' : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}
