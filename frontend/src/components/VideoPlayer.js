import React, { useState, useEffect, useRef } from 'react';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import useDragger from '../hooks/useDragger';
import { isEmpty } from '../utils/utils';
import Subtitle from '../models/Subtitle';

export const OVERLAY_ENCLOSURE_ID = 'OVERLAY_ENCLOSURE_ID';
export const VIDEO_PLAYER_ID = 'VIDEO_PLAYER_ID';
export const SUBTITLE_OVERLAY_ID = 'SUBTITLE_OVERLAY_ID';
export const ACTIVE_OVERLAY_LINE_ID = 'ACTIVE_OVERLAY_LINE_ID';
export const SUBTITLE_OVERLAY_LINE_CLASS = 'SUBTITLE_OVERLAY_LINE_CLASS';

const VIDEO_BUTTON_OPTIONS = { PLAY: 'PLAY', PAUSE: 'PAUSE' };
const VIDEO_UPDATE_RATE_MS = 100;

export default function VideoPlayer(props) {
    const { subtitles, setSubtitles, videoTimeSec, setVideoTimeSec, selectionScope, selectedSubtitle, handleSubtitleClick } = props;

    const { videoFile, videoInfo } = useVideoUpload();
    const { name: videoName, durSec: videoDurSec } = videoInfo;

    const [videoSrc, setVideoSrc] = useState('');
    const [videoButton, setVideoButton] = useState(VIDEO_BUTTON_OPTIONS.PLAY);
    const [videoInterval, setVideoInterval] = useState(null);
    const [subtitleOverlay, setSubtitleOverlay] = useState(null);

    const videoRef = useRef();
    const subtitleOverlayRef = useRef();
    const progressBarRef = useRef();

    const inputClicked = useRef(null);
    const videoPlaying = useRef(false);

    useDragger(selectionScope <= 1 ? SUBTITLE_OVERLAY_ID : null, draggerCallback);

    function draggerCallback(coords) {
        const { lastX, lastY } = coords;
        const index = subtitleOverlay?.index;

        if (!isEmpty(index)) {
            const newSubtitles = [...subtitles];
            // newSubtitles[index].lines = [...newSubtitles[index].lines];
            newSubtitles[index].positionX = lastX;
            newSubtitles[index].positionY = lastY;

            setSubtitles(newSubtitles);
        }
    }

    function handlePlayPauseButtonClick() {
        if (videoButton === VIDEO_BUTTON_OPTIONS.PLAY) {
            videoPlaying.current = true;
            videoRef.current.play();

            const interval = setInterval(() => {
                setVideoTimeSec(videoRef.current.currentTime);
            }, VIDEO_UPDATE_RATE_MS);
            setVideoInterval(interval);

            setVideoButton(VIDEO_BUTTON_OPTIONS.PAUSE);
        } else {
            videoPlaying.current = false;
            videoRef.current.pause();

            clearInterval(videoInterval);
            setVideoInterval(null);

            setVideoButton(VIDEO_BUTTON_OPTIONS.PLAY);
        }
    }

    useEffect(() => {
        if (!videoPlaying.current) {
            videoRef.current.currentTime = videoTimeSec; // changes video.currentTime when videoTimeSec changes
        }
    }, [videoTimeSec]);

    useEffect(() => {
        if (videoFile) {
            const videoURL = URL.createObjectURL(videoFile);
            setVideoSrc(videoURL);
        }
    }, [videoFile]);

    useEffect(() => {
        if (selectionScope > 0 && !isEmpty(selectedSubtitle)) {
            setVideoTimeSec(subtitles[selectedSubtitle].startSec);
        }

        if (selectionScope <= 1) clearActiveLine();
    }, [selectedSubtitle, selectionScope]);

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

    function handleOverlayClick(e) {
        if (!e.target.classList.contains(SUBTITLE_OVERLAY_LINE_CLASS)) return;

        const index = parseInt(e.target?.dataset?.index);
        const newSelectionScope = selectionScope + 1;

        if (selectionScope < 2) {
            handleSubtitleClick(index, newSelectionScope);
        }

        clearActiveLine();

        if (subtitleOverlayRef.current.dataset.dragged === 'true') {
            subtitleOverlayRef.current.dataset.dragged = 'false';
        } else if (newSelectionScope >= 2) {
            e.target.id = ACTIVE_OVERLAY_LINE_ID;
        }
    }

    function clearActiveLine() {
        const activeLine = document.getElementById(ACTIVE_OVERLAY_LINE_ID);
        if (activeLine) activeLine.id = '';
    }

    function updateLine(e) {
        const index = parseInt(e.target.dataset.index);
        const line = parseInt(e.target.dataset.line);

        const newSubtitles = [...subtitles];
        newSubtitles[index].lines = [...newSubtitles[index].lines];
        newSubtitles[index].lines[line - 1] = e.target.value;
        setSubtitles(newSubtitles);
    }

    function textShadowStyle(borderW, borderColor) {
        return [
            borderColor + ' 0px 0px',
            ', ' + borderColor + ' -0.5px 0px, ' + borderColor + ' 0px 0.5px, ' + borderColor + ' 0.5px 0px, ' + borderColor + ' 0px -0.5px',
            ', ' + borderColor + ' -1px 0px, ' + borderColor + ' 0px 1px, ' + borderColor + ' 1px 0px, ' + borderColor + ' 0px -1px',
            ', ' + borderColor + ' -1.5px 0px, ' + borderColor + ' 0px 1.5px, ' + borderColor + ' 1.5px 0px, ' + borderColor + ' 0px -1.5px',
            ', ' + borderColor + ' -2px 0px, ' + borderColor + ' 0px 2px, ' + borderColor + ' 2px 0px, ' + borderColor + ' 0px -2px',
            ', ' + borderColor + ' -2.5px 0px, ' + borderColor + ' 0px 2.5px, ' + borderColor + ' 2.5px 0px, ' + borderColor + ' 0px -2.5px'
        ].slice(0, borderW + 1).join('');
    }

    function handleProgressBarClick(e) {
        const { offsetLeft, offsetWidth } = progressBarRef.current;
        const ratio = (e.clientX - offsetLeft) / offsetWidth;
        const newVideoTimeSec = ratio * videoDurSec;

        videoRef.current.currentTime = newVideoTimeSec;
        setVideoTimeSec(videoRef.current.currentTime);
    }

    function modifyVideoCurrentTime(modSec) {
        let newVideoTimeSec = videoRef.current.currentTime + modSec;
        if (newVideoTimeSec < 0) newVideoTimeSec = 0;
        if (newVideoTimeSec > videoDurSec) newVideoTimeSec = videoDurSec;

        videoRef.current.currentTime = newVideoTimeSec;
        setVideoTimeSec(videoRef.current.currentTime);
    }

    return (
        <div>
            <div>
                <div>
                    <div className='bg-primary overflow-hidden' style={{ height: '400px', width: '400px' }}>
                        <div id={OVERLAY_ENCLOSURE_ID} className='position-relative d-flex justify-content-center align-items-center h-100 w-100' style={{ overflow: 'hidden' }}>
                            <div id={SUBTITLE_OVERLAY_ID} ref={subtitleOverlayRef}
                                onClick={e => handleOverlayClick(e)}
                                className='position-absolute border border-black'
                                style={{ cursor: 'pointer', zIndex: '10' }}>
                                {subtitleOverlay?.lines?.map((line, _index) => {
                                    const { text, dataset } = Subtitle.parseLine(line);

                                    const font = dataset.font ?? subtitleOverlay.font ?? undefined;
                                    const fontSize = dataset.fontSize ?? subtitleOverlay.fontSize ?? undefined;
                                    const fontColor = dataset.fontColor ?? subtitleOverlay.fontColor ?? undefined;
                                    const borderW = dataset.borderW ?? subtitleOverlay.borderW ?? undefined;
                                    const borderColor = dataset.borderColor ?? subtitleOverlay.borderColor ?? undefined;
                                    const bold = dataset.bold ?? subtitleOverlay.bold ?? undefined;
                                    const italic = dataset.italic ?? subtitleOverlay.italic ?? undefined;
                                    const underline = dataset.underline ?? subtitleOverlay.underline ?? undefined;
                                    const align = subtitleOverlay.align ?? undefined;

                                    return (
                                        <input key={_index}
                                            type='text'
                                            readOnly={true}
                                            value={text}
                                            onChange={e => updateLine(e)}
                                            className={SUBTITLE_OVERLAY_LINE_CLASS + ' w-100'}
                                            style={{
                                                display: 'block',
                                                userSelect: 'none',
                                                cursor: 'pointer',
                                                border: 'none',
                                                outline: selectionScope > 0 ? 'dashed black 1px' : 'none',
                                                fontFamily: font,
                                                fontSize: `${fontSize}px`,
                                                color: fontColor,
                                                textShadow: textShadowStyle(borderW, borderColor),
                                                fontWeight: bold === true ? 'bold' : 'normal',
                                                fontStyle: italic === true ? 'italic' : 'normal',
                                                textDecoration: underline === true ? 'underline' : 'none',
                                                textAlign: align
                                            }}
                                            data-selectionscope={selectionScope} data-index={subtitleOverlay.index} data-line={_index + 1}>
                                        </input>
                                    )
                                })}
                            </div>
                            <video id={VIDEO_PLAYER_ID}
                                onPause={e => setVideoButton(VIDEO_BUTTON_OPTIONS.PLAY)}
                                src={videoSrc} ref={videoRef}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                data-playing={videoButton === VIDEO_BUTTON_OPTIONS.PLAY ? 'false' : 'true'}>
                            </video>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='d-flex justify-content-center align-items-center' style={{ height: '30px', width: '100%' }}>
                        <div ref={progressBarRef} onClick={e => handleProgressBarClick(e)}
                            style={{ height: '50%', width: '90%', cursor: 'pointer', backgroundColor: 'red' }}>
                            <div style={{ height: '100%', width: `${(videoTimeSec / videoDurSec * 100)}%`, cursor: 'pointer', pointerEvents: 'none', backgroundColor: 'blue' }}></div >
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center gap-2'>
                        <button onClick={e => modifyVideoCurrentTime(-videoDurSec)}>Start</button>
                        <button onClick={e => modifyVideoCurrentTime(-10)}>-10s</button>
                        <div className='d-flex justify-content-center align-items-center'>
                            <button data-selectionscope={selectionScope}
                                onClick={e => handlePlayPauseButtonClick()}>
                                {videoButton === VIDEO_BUTTON_OPTIONS.PLAY ? 'Play' : videoButton === VIDEO_BUTTON_OPTIONS.PAUSE ? 'Pause' : ''}
                            </button>
                        </div>
                        <button onClick={e => modifyVideoCurrentTime(10)}>+10s</button>
                        <button onClick={e => modifyVideoCurrentTime(videoDurSec)}>End</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
