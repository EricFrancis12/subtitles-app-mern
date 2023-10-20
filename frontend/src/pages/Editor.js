import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Tabs, Tab, Accordion } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import { useSubtitles } from '../contexts/SubtitlesContext';
import useHistory from '../hooks/useHistory';
import { Navigate } from 'react-router-dom';
import defaultEditorSettings from '../config/defaultEditorSettings.json';
import editorOptions from '../config/editorOptions.json';
import selectionScopes from '../config/selectionScopes.json';
import Subtitle from '../models/Subtitle';
import HistoryItem from '../models/HistoryItem';
import InputLine from '../components/InputLine';
import Test from '../components/Test';
import Timeline from '../components/Timeline';
import Transcript from '../components/Transcript';
import VideoPlayer from '../components/VideoPlayer';
import { isEmpty } from '../utils/utils';
import { SUBTITLE_OVERLAY_LINE_CLASS } from '../components/VideoPlayer';
import { ACTIVE_OVERLAY_LINE_ID } from '../components/VideoPlayer';
import StylePanel from '../components/StylePanel';
import ExportPanel from '../components/ExportPanel';
import { INPUT_LINE_CLASS } from '../components/InputLine';
import { DEFAULT_STYLE_PANEL } from '../components/StylePanel';

const MAX_NUM_LINES = 4;

export default function Editor(props) {
    const { numLinesOptions, numWordsPerLineOptions } = props;

    const { userClient } = useAuth();
    const { subtitlesData, setSubtitlesData, numLines, setNumLines, numWordsPerLine, setNumWordsPerLine } = useSubtitles();

    // const [subtitles, setSubtitles, undo, redo] = useHistory([]); // un-comment to use undo/redo system
    const [subtitles, setSubtitles, undo, redo] = useState([]);

    const selectedSubtitleRef = useRef();
    const selectionRef = useRef();
    const globalStylePanel = useRef();

    useEffect(() => {
        globalStylePanel.current = { ...stylePanel };
    }, []);

    const [loading, setLoading] = useState(false);
    const [selectedSubtitle, setSelectedSubtitle] = useState(null);
    const [selectionScope, setSelectionScope] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ index: null, line: null, position: null });
    const [videoTimeSec, setVideoTimeSec] = useState(0);
    const [stylePanel, setStylePanel] = useState(DEFAULT_STYLE_PANEL);

    function handleSubtitleClick(index, selectionScope = 1) {
        setSelectionScope(selectionScope);
        setSelectedSubtitle(index);
    }

    function updateLine(e) {
        const index = parseInt(e.target.dataset.index);
        const line = parseInt(e.target.dataset.line);
        const position = e.target.selectionStart;

        const newSubtitles = [...subtitles];

        newSubtitles[index].lines[line - 1] = e.target.value;

        setSubtitles(newSubtitles);
    }

    function calculateDefaultSubtitles() {
        const defaultSubtitles = [];

        for (let i = 0; i < subtitlesData.words.length; i++) {
            const subtitle = new Subtitle({ userClient });
            i = subtitle.fill(subtitlesData, numLines, numWordsPerLine, i);
            defaultSubtitles.push(subtitle);
        }

        setSubtitles(defaultSubtitles);
    }

    useEffect(() => {
        if (subtitlesData) {
            calculateDefaultSubtitles();
        }

        // selects first subtitle (at index 0), and sets selectionScope to 1 by default:
        setTimeout(() => {
            setSelectionScope(1);
            setSelectedSubtitle(0);
        }, 0);
    }, [numLines, numWordsPerLine]);

    useEffect(() => {
        if (selectionScope === 0) {
            setSelectedSubtitle(null);
        }
    }, [selectionScope]);

    useEffect(() => {
        // if (selectedSubtitleRef.current) {
        //     selectedSubtitleRef.current.scrollIntoView({
        //         behavior: 'smooth',
        //         block: 'end' // 'start', 'center', or 'end'
        //     });
        // }

        if (!isEmpty(selectedSubtitle)) {
            setStylePanel({
                ...stylePanel,
                font: {
                    ...stylePanel.font,
                    value: subtitles[selectedSubtitle].font
                },
                fontSize: {
                    ...stylePanel.fontSize,
                    value: subtitles[selectedSubtitle].fontSize
                },
                fontColor: {
                    ...stylePanel.fontColor,
                    value: subtitles[selectedSubtitle].fontColor
                },
                borderW: {
                    ...stylePanel.borderW,
                    value: subtitles[selectedSubtitle].borderW
                },
                borderColor: {
                    ...stylePanel.borderColor,
                    value: subtitles[selectedSubtitle].borderColor
                },
                backgroundColor: {
                    ...stylePanel.backgroundColor,
                    value: subtitles[selectedSubtitle].backgroundColor
                },
                bold: {
                    ...stylePanel.bold,
                    value: subtitles[selectedSubtitle].bold
                },
                italic: {
                    ...stylePanel.italic,
                    value: subtitles[selectedSubtitle].italic
                },
                underline: {
                    ...stylePanel.underline,
                    value: subtitles[selectedSubtitle].underline
                }
            });
        }
    }, [selectedSubtitle]);

    useEffect(() => {
        // global click listener that changes selectionScope:
        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);

        function handleClick(e) {
            function traverseParents(element) {
                const clickSelectionScope = parseInt(element?.dataset?.selectionscope);
                if (clickSelectionScope) {
                    return clickSelectionScope; // Found a valid selectionScope, return it
                } else if (element !== document.body) {
                    return traverseParents(element.parentNode); // Recursive call and return its result
                }
                return null; // If no valid selectionScope found, return null
            }

            const clickSelectionScope = traverseParents(e.target);
            if (isEmpty(clickSelectionScope)) {
                setSelectionScope(0);
                setStylePanel(globalStylePanel.current || DEFAULT_STYLE_PANEL);
            } else {
                setSelectionScope(clickSelectionScope);
            }
        }
    }, []);

    useEffect(() => {
        // Global keydown listener, covering multiple key handlers:
        document.addEventListener('keydown', handleKeydown);

        return () => document.removeEventListener('keydown', handleKeydown);

        function handleKeydown(e) {
            if (e.key.toUpperCase() === 'ENTER' && document.activeElement.classList.contains(INPUT_LINE_CLASS)) {
                handleEnter(e);
            } else if (e.key.toUpperCase() === 'BACKSPACE' && document.activeElement.classList.contains(INPUT_LINE_CLASS)) {
                handleBackspace(e);
            }
        }
    }, [subtitles]);

    function handleEnter(e) {
        if (e.key.toUpperCase() === 'ENTER' && document.activeElement instanceof HTMLInputElement) {

            const input = document.activeElement;
            const index = parseInt(input.dataset?.index);

            const breakpoint = input.selectionStart;
            const breakpointLineNumber = parseInt(input.dataset?.line);

            const beforeBreakpoint = input.value.substring(0, breakpoint);
            const afterBreakpoint = input.value.substring(breakpoint, input.value.length);

            const newSubtitles = [...subtitles];

            const _numLines = subtitles[index].lines.length;
            if (_numLines < MAX_NUM_LINES) {
                // if there's room to add another line to the subtitle
                const newSubtitle = new Subtitle({
                    options: {
                        ...subtitles[index]
                    }
                });

                newSubtitle.lines.splice(breakpointLineNumber - 1, 1, beforeBreakpoint, afterBreakpoint);

                newSubtitles.splice(index, 1, newSubtitle);
                setCursorPosition({ index, line: breakpointLineNumber + 1, position: 0 });
            } else {
                // if there's no room, create another subtitle
                const duration = subtitles[index].endSec - subtitles[index].startSec;
                const totalChars = subtitles[index].lines.join('').length;
                const ratio = absoluteBreakpoint(subtitles[index], breakpoint, breakpointLineNumber) / totalChars;
                const newTimeSec = subtitles[index].startSec + duration * ratio;

                function absoluteBreakpoint(subtitle, breakpoint, lineNumber) {
                    // calcs the breakpoint considering all chars, of all lines:
                    let sum = 0;
                    for (let i = 1; i < lineNumber; i++) {
                        sum += subtitle.lines[i - 1].length;
                    }
                    return sum + breakpoint;
                }

                const newSubtitleA = new Subtitle({
                    options: {
                        ...subtitles[index],
                        endSec: newTimeSec,
                        lines: [...subtitles[index].lines]
                    }
                });
                newSubtitleA.lines.splice(breakpointLineNumber - 1, newSubtitleA.lines.length + 9999, beforeBreakpoint);

                const newSubtitleB = new Subtitle({
                    options: {
                        ...subtitles[index],
                        startSec: newTimeSec,
                        lines: [...subtitles[index].lines]
                    }
                });
                newSubtitleB.lines.splice(0, breakpointLineNumber, afterBreakpoint);

                newSubtitles.splice(index, 1, newSubtitleA, newSubtitleB);
                setCursorPosition({ index: index + 1, line: 1, position: 0 });
                setSelectedSubtitle(index + 1);
            }

            setSubtitles(newSubtitles);
        }
    }

    function handleBackspace(e) {
        const input = document.activeElement;
        const index = parseInt(input.dataset?.index);
        const lineNumber = parseInt(input.dataset?.line);

        if (input.selectionStart !== 0 || (index === 0 && lineNumber === 1)) return null;
        const totalNumLines = subtitles[index].lines.length + subtitles[index - 1]?.lines?.length;
        const newSubtitles = [...subtitles];

        if (lineNumber === 1) {
            if (totalNumLines > MAX_NUM_LINES + 1) return null;

            // combine this subtitle with the one before it:
            e.preventDefault();

            const combinedSubtitle = new Subtitle({
                options: {
                    ...subtitles[index - 1],
                    lines: [...subtitles[index - 1].lines],
                    startSec: subtitles[index - 1].startSec,
                    endSec: subtitles[index].endSec,
                    confidence: (subtitles[index - 1].confidence + subtitles[index].confidence) / 2
                }
            });

            if (totalNumLines === MAX_NUM_LINES + 1) {
                // if 5 totalNumLines, we are merging the 2 at the breakpoint, to finish with 4:
                combinedSubtitle.lines = [...(subtitles[index - 1].lines.join('\n') + subtitles[index].lines.join('\n')).split('\n')];
                setCursorPosition({ index: index - 1, line: subtitles[index - 1].lines.length, position: subtitles[index - 1].lines.at(-1).length });
            } else {
                // if 4 or less totalNumLines, we can simply lay them out one-after-another:
                combinedSubtitle.lines.splice(subtitles[index - 1].lines.length, combinedSubtitle.lines.length + 9999, ...subtitles[index].lines);
                setCursorPosition({ index: index - 1, line: subtitles[index - 1].lines.length + 1, position: 0 });
            }

            newSubtitles.splice(index - 1, 2, combinedSubtitle);
            setSelectedSubtitle(index - 1);

        } else {
            // join this line with the one before it:
            e.preventDefault();

            const newSubtitle = new Subtitle({
                options: {
                    ...subtitles[index],
                    lines: [...subtitles[index].lines]
                }
            });
            setCursorPosition({ index: index, line: lineNumber - 1, position: newSubtitle?.lines[lineNumber - 2]?.length });
            newSubtitle.lines.splice(lineNumber - 2, 2, newSubtitle.lines[lineNumber - 2] + newSubtitle.lines[lineNumber - 1]);

            newSubtitles.splice(index, 1, newSubtitle);
        }

        setSubtitles(newSubtitles);
    }

    // Below useEffect is for moving to selectionScope 3, which is the user's (highlighted) selection inside an individual line.
    // Still a working progress...

    // useEffect(() => {
    //     document.addEventListener('selectionchange', handleSelectionChange);

    //     return () => document.removeEventListener('selectionchange', handleSelectionChange);

    //     function handleSelectionChange() {
    //         const selection = window.getSelection();

    //         if (selection && selection.toString().trim() !== '' && selectionScope >= 2 && document.activeElement.classList.contains(SUBTITLE_OVERLAY_LINE_CLASS)) {
    //             selectionRef.current = selection.toString();
    //             setSelectionScope(3);
    //         } else {
    //             selectionRef.current = '';
    //         }
    //     }
    // }, []);

    function handleStylePanelChange(style, value) {
        value = Subtitle.parseValue(style, value);

        const newSubtitles = [...subtitles];
        if (newSubtitles[selectedSubtitle]?.lines) newSubtitles[selectedSubtitle].lines = [...newSubtitles[selectedSubtitle].lines];

        const newStylePanel = { ...stylePanel };
        newStylePanel[style].value = value;

        if (!selectionScope || selectionScope === 0) {
            // globally apply style to all subtitles
            newSubtitles.forEach((subtitle, index) => {
                subtitle[style] = value;

                overrideStyle(subtitle.lines, style);
            });

            globalStylePanel.current = newStylePanel;
        } else if (selectionScope === 1) {
            // apply style to only selected subtitle
            newSubtitles[selectedSubtitle][style] = value;

            overrideStyle(newSubtitles[selectedSubtitle].lines, style);
        } else if (selectionScope >= 2) {
            // apply style to only the selected line the user is currently in

            if (style === 'align') return; // align is applied only at the subtitle level (selectionScope of 1 or less), not to individual lines

            const overlayLine = document.getElementById(ACTIVE_OVERLAY_LINE_ID);
            const lineNumber = parseInt(overlayLine?.dataset?.line);

            if (lineNumber) {
                const line = newSubtitles[selectedSubtitle].lines[lineNumber - 1];
                const { text, dataset } = Subtitle.parseLine(line);
                dataset[style] = value;
                const newLine = makeNewLineString(text, dataset);
                newSubtitles[selectedSubtitle].lines[lineNumber - 1] = newLine;
            }
        }

        setStylePanel(newStylePanel);
        setSubtitles(newSubtitles);

        function overrideStyle(lines, style) {
            lines.forEach((line, _index) => {
                const { text, dataset } = Subtitle.parseLine(line);
                dataset[style] = undefined;
                const newLine = makeNewLineString(text, dataset);
                lines[_index] = newLine;
            });
        }

        function makeNewLineString(text, dataset) {
            return `<span ${Object.keys(dataset).map(key => dataset[key] != undefined ? `data-${key}="${dataset[key]}"` : '').join(' ')}>${text}</span>`;
        }
    }

    return (
        <div className='d-flex flex-column justify-items-center align-items-center w-100'>
            <div className='d-flex justify-items-between align-items-center m-4' style={{ gap: '30px' }}>
                <div>
                    <br></br>
                    <div>
                        <button onClick={e => undo()}>Undo</button>
                    </div>
                    <br></br>
                    <div>
                        <button onClick={e => redo()}>Redo</button>
                    </div>
                    <br></br>
                </div>
                <div>
                    <p>Selection Scope: {selectionScope}</p>
                </div>
                <div>
                    <Form.Group>
                        <Form.Label>Change Number of Lines:</Form.Label>
                        <Form.Select defaultValue={numLines} onChange={(e) => setNumLines(parseInt(e.target.value))} data-selectionscope='1'>
                            {numLinesOptions.map((option, index) => <option value={option} key={index}>{option}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Change Number of Words Per Line:</Form.Label>
                        <Form.Select defaultValue={numWordsPerLine} onChange={(e) => setNumWordsPerLine(parseInt(e.target.value))} data-selectionscope='1'>
                            {numWordsPerLineOptions.map((option, index) => <option value={option} key={index}>{option}</option>)}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>
            <div className='d-flex justify-items-between align-items-start flex-wrap'>
                <div data-selectionscope='1'>
                    <Tabs defaultActiveKey="subtitles">
                        <Tab eventKey="subtitles" title="Subtitles">
                            <div className='overflow-scroll' style={{ maxHeight: '60vh' }}>
                                {subtitles.map((subtitle, index) => {
                                    const selected = selectedSubtitle === index;

                                    return (
                                        <div onClick={e => handleSubtitleClick(index, 1)}
                                            ref={selected ? selectedSubtitleRef : null}
                                            key={index}
                                            style={{
                                                minHeight: selected ? '150px' : '0px',
                                                backgroundColor: selected ? '' : 'white',
                                                transition: 'min-height 0.5s ease-in-out, background-color 0.3s ease-in-out'
                                            }}
                                            className={(selected && 'selected-subtitle') + ' border border-black rounded m-2 p-2'}
                                            data-selectionscope='1' data-numlines={subtitle.lines.length}>
                                            <div>
                                                {subtitle.lines.map((line, _index) => {
                                                    return (
                                                        <InputLine value={Subtitle.parseLine(line).text}
                                                            key={_index}
                                                            onChange={e => updateLine(e)}
                                                            index={index} line={_index + 1} selected={selected}
                                                            cursorPosition={cursorPosition}
                                                        />
                                                    )
                                                })}
                                            </div>
                                            {selected
                                                ? <div>
                                                    <p>Start: {subtitle.startSec?.toFixed(2)}</p>
                                                    <p>End: {subtitle?.endSec?.toFixed(2)}</p>
                                                    <p>Confidence: {(subtitle.confidence * 100).toFixed(2) || '--:--'}%</p>
                                                </div>
                                                : ''}
                                        </div>
                                    )
                                })}
                            </div>
                        </Tab>
                        <Tab eventKey="transcript" title="Transcript">
                            <Transcript subtitles={subtitles}
                                selectedSubtitle={selectedSubtitle}
                                handleSubtitleClick={handleSubtitleClick} />
                        </Tab>
                    </Tabs>
                </div>
                <div data-selectionscope={selectionScope}>
                    <StylePanel stylePanel={stylePanel} handleStylePanelChange={handleStylePanelChange} />
                    {/* {Object.keys(styleButtons).map((style, index) => {
                        return (
                            <div key={index} data-selectionscope={selectionScope}>
                                <button onClick={e => handleStylePanelChange(style, styleButtons[style].value)}>{styleButtons[style].name}</button>
                            </div>
                        )
                    })} */}
                    <ExportPanel subtitles={subtitles} globalStylePanel={globalStylePanel.current} selectionScope={selectionScope} />
                    <Test />
                </div>
                <VideoPlayer subtitles={subtitles}
                    setSubtitles={setSubtitles}
                    videoTimeSec={videoTimeSec}
                    setVideoTimeSec={setVideoTimeSec}
                    selectionScope={selectionScope}
                    selectedSubtitle={selectedSubtitle}
                    handleSubtitleClick={handleSubtitleClick} />
            </div>
            <Timeline subtitles={subtitles}
                setSubtitles={setSubtitles}
                videoTimeSec={videoTimeSec}
                setVideoTimeSec={setVideoTimeSec}
                selectedSubtitle={selectedSubtitle}
                handleSubtitleClick={handleSubtitleClick}
            />
        </div>
    )
}
