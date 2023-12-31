import React, { useState, useEffect, useRef } from 'react';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import Subtitle from '../models/Subtitle';
import useExpander from '../hooks/useExpander.js';
import { VIDEO_PLAYER_ID } from './VideoPlayer.js';

const SCROLLING_CONSTANT = 4; // increase/decrease this to set the speed at which the timeline expands/contracts when scrolled
const MIN_TIMELINE_WIDTH = 1000;

export default function Timeline(props) {
    const { subtitles, setSubtitles, videoTimeSec, setVideoTimeSec, selectedSubtitle, handleSubtitleClick } = props;

    const { videoInfo } = useVideoUpload();
    const { name: videoName, durSec: videoDurSec } = videoInfo;

    const timelineRef = useRef();
    const selectedSubtitleRef = useRef();
    const timelineIndicatorRef = useRef();
    const mouseIndicatorRef = useRef();

    const [timelineWidth, setTimelineWidth] = useState(5000);
    const [timelineIndicatorLeft, setTimelineIndicatorLeft] = useState(0);
    const [mouseIndicatorLeft, setMouseIndicatorLeft] = useState(0);

    useExpander('left-timeline-expander', [selectedSubtitle, timelineWidth], expanderCallback);
    useExpander('right-timeline-expander', [selectedSubtitle, timelineWidth], expanderCallback);

    function expanderCallback(props) {
        const { startX, lastX, startWidth, lastWidth, startLeft, lastLeft } = props.coords;

        const newSubtitles = [...subtitles];
        const newStartSec = lastLeft / timelineWidth * videoDurSec;
        const newEndSec = (lastLeft + lastWidth) / timelineWidth * videoDurSec;

        const subtitle = new Subtitle({
            options: {
                ...subtitles,
                lines: [...subtitles[selectedSubtitle].lines],
                startSec: newStartSec,
                endSec: newEndSec
            }
        });

        newSubtitles.splice(selectedSubtitle, 1, subtitle);
        setSubtitles(newSubtitles);
        setVideoTimeSec(newStartSec);
    }

    useEffect(() => {
        // if (selectedSubtitleRef.current) {
        //     selectedSubtitleRef.current.scrollIntoView({
        //         behavior: 'smooth',
        //         block: 'end' // 'start', 'center', or 'end'
        //     });
        // }
    }, [selectedSubtitle]);

    useEffect(() => {
        timelineRef.current.addEventListener('click', handleTimelineClick);

        return () => timelineRef.current?.removeEventListener('click', handleTimelineClick);

        function handleTimelineClick(e) {
            if (e.target !== timelineRef.current) return;

            const newVideoTimeSec = (e.offsetX + e.target.scrollLeft) / timelineWidth * videoDurSec;

            setVideoTimeSec(newVideoTimeSec);
            setTimelineIndicatorLeft(e.offsetX + e.target.scrollLeft);
        }
    }, []);

    // moves timelineIndicator automoatically when video is playing:
    useEffect(() => {
        const videoCurrentTime = (videoTimeSec / videoDurSec) * timelineWidth;
        const gap = 30;

        // Check if the indicator line is in view
        const timeline = timelineRef.current;
        const indicator = timelineIndicatorRef.current;
        const timelineLeft = timeline.scrollLeft;
        const timelineRight = timelineLeft + timeline.offsetWidth;
        const indicatorLeft = timelineIndicatorLeft;
        const indicatorRight = indicatorLeft + indicator.offsetWidth;

        if (indicatorRight > timelineRight - gap || indicatorLeft < timelineLeft + gap) {
            timeline.scrollLeft = indicatorLeft - gap;
        }

        const playing = document.getElementById(VIDEO_PLAYER_ID)?.dataset?.playing === 'true';
        if (playing) {
            setTimelineIndicatorLeft(videoCurrentTime);
        }
    }, [videoTimeSec]);

    useEffect(() => {
        timelineRef.current.addEventListener('mousemove', handleMouseMove);

        return () => {
            if (timelineRef.current) timelineRef.current.removeEventListener('mousemove', handleMouseMove);
        }

        function handleMouseMove(e) {
            // setMouseIndicatorLeft(e.clientX);
        };
    }, []);

    useEffect(() => {
        timelineRef.current.addEventListener('wheel', handleScroll);

        return () => timelineRef.current?.removeEventListener('wheel', handleScroll);

        function handleScroll(e) {
            e.preventDefault();
            const newWidth = timelineWidth + e.deltaY * -1 * SCROLLING_CONSTANT;

            if (newWidth >= MIN_TIMELINE_WIDTH) {
                setTimelineWidth(newWidth);
            }
        };
    }, [timelineWidth]);

    return (
        <div className='w-100 bg-primary' style={{ height: '20vh', userSelect: 'none' }}>
            <div className='position-relative overflow-scroll h-100 p-2' ref={timelineRef}>
                <div ref={timelineIndicatorRef} className='position-absolute' style={{ left: `${timelineIndicatorLeft}px`, height: '100%', width: '4px', backgroundColor: 'orange', zIndex: '10' }}></div>
                <div ref={mouseIndicatorRef} className='position-absolute' style={{ left: `${mouseIndicatorLeft}px`, height: '100%', width: '2px', backgroundColor: 'red', pointerEvents: 'none', zIndex: '20' }}>
                    {/* mouseIndicatorRef.current.offsetLeft / timelineWidth * videoDurSec */}
                </div>
                {subtitles.map((subtitle, index) => {
                    const { startSec, endSec } = subtitle;
                    const durSec = endSec - startSec;
                    const wRatio = durSec / videoDurSec;
                    const width = (wRatio * timelineWidth) + 'px';

                    const lRatio = startSec / videoDurSec;
                    const left = (lRatio * timelineWidth) + 'px';

                    return (
                        <div key={index}
                            onClick={e => {
                                handleSubtitleClick(index, 1);
                                setVideoTimeSec(startSec);
                                setTimelineIndicatorLeft(startSec / videoDurSec * timelineWidth);
                            }}
                            ref={selectedSubtitle === index ? selectedSubtitleRef : null}
                            className={(selectedSubtitle === index ? 'selected-subtitle' : 'bg-secondary') + ' position-absolute border border-black'}
                            style={{ width, left, height: '90%' }}
                            data-selectionscope='1' data-startsec={startSec} data-endsec={endSec}>

                            <div className='position-relative' style={{ height: '100%', width: '100%' }}>
                                {selectedSubtitle === index && <div id='left-timeline-expander'></div>}
                                {selectedSubtitle === index && <div id='right-timeline-expander'></div>}

                                {subtitle.lines.map((line, _index) => {
                                    return (
                                        <div key={_index}>
                                            {Subtitle.parseLine(line).text}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
