import React, { useState, useEffect, useRef } from 'react';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import useDragger from '../hooks/useDragger';
import { isEmpty } from '../utils/utils';

export const SUBTITLE_OVERLAY = 'SUBTITLE_OVERLAY';
export const SUBTITLE_OVERLAY_LINE = 'SUBTITLE_OVERLAY_LINE';
export const ACTIVE_OVERLAY_LINE_ID = 'ACTIVE_OVERLAY_LINE_ID';
const VIDEO_BUTTON_OPTIONS = { PLAY: 'PLAY', PAUSE: 'PAUSE' };
const VIDEO_UPDATE_RATE_MS = 100;

export function parseHtmlString(htmlString) {
    // Create a temporary div element to parse the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Check if there is an outer element
    if (tempDiv.children.length === 1) {
        const innerText = tempDiv.children[0].textContent;

        // Convert dataset attributes to an object
        const dataset = {};
        const attributes = tempDiv.children[0].attributes;
        for (let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            if (attribute.name.startsWith('data-')) {
                const value = attribute.value === 'true' || attribute.value === 'false' ? JSON.parse(attribute.value) : attribute.value;
                dataset[attribute.name.substring(5)] = value;
            }
        }

        tempDiv.remove();
        return { text: innerText, dataset };
    } else {
        tempDiv.remove();
        return { text: htmlString, dataset: {} }; // No outer element, return the inner text
    }
}

export default function VideoPlayer(props) {
    const { subtitles, setSubtitles, videoTimeSec, setVideoTimeSec, selectionScope, selectedSubtitle, handleSubtitleClick } = props;

    const { videoFile } = useVideoUpload();

    const [videoSrc, setVideoSrc] = useState('');
    const [videoButton, setVideoButton] = useState(VIDEO_BUTTON_OPTIONS.PLAY);
    const [videoInterval, setVideoInterval] = useState(null);
    const [subtitleOverlay, setSubtitleOverlay] = useState(null);

    const videoRef = useRef();
    const subtitleOverlayRef = useRef();
    const inputClicked = useRef(null);

    useDragger(selectionScope <= 1 ? SUBTITLE_OVERLAY : null, draggerCallback);

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
        if (selectionScope > 0 && !isEmpty(selectedSubtitle)) {
            setVideoTimeSec(subtitles[selectedSubtitle].startSec);
        }
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
                inputClicked.current.id = ACTIVE_OVERLAY_LINE_ID;
            } else if (!inputClicked.current && e.target.classList.contains(SUBTITLE_OVERLAY_LINE)) {
                inputClicked.current = e.target;
            } else {
                if (inputClicked.current) {
                    inputClicked.current.dataset.selectionscope = '1';
                    inputClicked.current.id = '';
                }
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

    function textShadowStyle(borderW, borderColor) {
        return [
            borderColor + ' 0px 0px',
            ', ' + borderColor + ' -0.5px 0px, ' + borderColor + ' 0px 0.5px, ' + borderColor + ' 0.5px 0px, ' + borderColor + ' 0px -0.5px',
            ', ' + borderColor + ' -1px 0px, ' + borderColor + ' 0px 1px, ' + borderColor + ' 1px 0px, ' + borderColor + ' 0px -1px',
            ', ' + borderColor + ' -1.5px 0px, ' + borderColor + ' 0px 1.5px, ' + borderColor + ' 1.5px 0px, ' + borderColor + ' 0px -1.5px',
            ', ' + borderColor + ' -2px 0px, ' + borderColor + ' 0px 2px, ' + borderColor + ' 2px 0px, ' + borderColor + ' 0px -2px',
            ', ' + borderColor + ' -2.5px 0px, ' + borderColor + ' 0px 2.5px, ' + borderColor + ' 2.5px 0px, ' + borderColor + ' 0px -2.5px'
        ].slice(0, borderW);
    }

    return (
        <div>
            <div>
                <div>
                    <div className='position-relative bg-primary overflow-hidden' style={{ height: '400px', width: '400px' }}>
                        <div id='SUBTITLE_OVERLAY' ref={subtitleOverlayRef} className='position-absolute border border-black' style={{ cursor: 'pointer', zIndex: '10' }}>
                            {subtitleOverlay?.lines?.map((line, _index) => {
                                const { text, dataset } = parseHtmlString(line);

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
                                        readOnly={selectionScope < 2 ? true : false}
                                        value={text}
                                        onChange={e => updateLine(e)}
                                        className={SUBTITLE_OVERLAY_LINE + ' w-100'}
                                        style={{
                                            display: 'block',
                                            cursor: 'pointer',
                                            fontFamily: font,
                                            fontSize: fontSize,
                                            color: fontColor,
                                            textShadow: textShadowStyle(borderW, borderColor),
                                            fontWeight: bold,
                                            fontStyle: italic,
                                            textDecoration: underline,
                                            textAlign: align
                                        }}
                                        data-selectionscope='1' data-index={subtitleOverlay.index} data-line={_index + 1}>
                                    </input>
                                )
                            })}
                        </div>
                        <video src={videoSrc} ref={videoRef} className='h-100 w-100'></video>
                    </div>
                </div>
                <div>
                    <button data-selectionscope={selectionScope}
                        onClick={e => handleVideoButtonClick()}>{videoButton === VIDEO_BUTTON_OPTIONS.PLAY ? 'Play' : videoButton === VIDEO_BUTTON_OPTIONS.PAUSE ? 'Pause' : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}
