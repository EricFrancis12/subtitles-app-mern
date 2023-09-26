import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import { useSubtitles } from '../contexts/SubtitlesContext';
import { useHistory } from '../contexts/HistoryContext';
import { Navigate } from 'react-router-dom';
import defaultEditorSettings from '../config/defaultEditorSettings.json';
import selectionScopes from '../config/selectionScopes.json';
import Subtitle from '../models/Subtitle';
import HistoryItem from '../models/HistoryItem';
import InputLine from '../components/InputLine';

export default function Editor(props) {
    const { numLinesOptions, numWordsPerLineOptions } = props;

    const subtitleLineNumbers = [1, 2, 3, 4];

    const { userClient } = useAuth();
    const { videoFile } = useVideoUpload();
    const { subtitlesData, setSubtitlesData, numLines, setNumLines, numWordsPerLine, setNumWordsPerLine } = useSubtitles();
    const { undoStack, redoStack, addToUndoStack, undo, redo } = useHistory();

    const [loading, setLoading] = useState(false);
    const [subtitles, setSubtitles] = useState([]);
    const [selectedSubtitle, setSelectedSubtitle] = useState(null);
    const [selectionScope, setSelectionScope] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ index: null, line: null, position: null });

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
    }, [numLines, numWordsPerLine]);

    useEffect(() => {
        if (selectionScope === 0) {
            setSelectedSubtitle(null);
        }
    }, [selectionScope]);

    useEffect(() => {
        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);

        function handleClick(e) {
            function traverseParents(element) {
                const clickSelectionScope = element?.dataset?.selectionscope && parseInt(element.dataset.selectionscope);
                if (clickSelectionScope) {
                    return clickSelectionScope; // Found a valid selectionScope, return it
                } else if (element !== document.body) {
                    return traverseParents(element.parentNode); // Recursive call and return its result
                }
                return null; // If no valid selectionScope found, return null
            }

            const clickSelectionScope = traverseParents(e.target);
            if (clickSelectionScope === null) {
                setSelectionScope(0);
            }
        }
    }, []);


    function handleSubtitleClick(index) {
        setSelectionScope(1);
        setSelectedSubtitle(index);
    }

    function updateLine(e) {
        const index = parseInt(e.target.dataset.index);
        const line = parseInt(e.target.dataset.line);
        const position = e.target.selectionStart;

        const newSubtitles = [...subtitles];
        newSubtitles[index][`line${line}`] = e.target.value;
        setSubtitles(newSubtitles);
        setCursorPosition({ index, line, position });
    }

    function updateCursorPosition(e) {
        const index = parseInt(e.target.dataset.index);
        const line = parseInt(e.target.dataset.line);
        const position = e.target.selectionStart;
        setCursorPosition({ index, line, position });
    }

    // Global keydown listener, covering multiple key handlers:
    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);

        return () => document.removeEventListener('keydown', handleKeydown);

        function handleKeydown(e) {
            if (e.key.toUpperCase() === 'ENTER' && document.activeElement instanceof HTMLInputElement) {
                handleEnter(e);
            } else if (e.key.toUpperCase() === 'BACKSPACE' && document.activeElement instanceof HTMLInputElement) {
                handleBackspace(e);
            }
        }
    }, [subtitles]);

    function handleEnter(e) {
        if (e.key.toUpperCase() === 'ENTER' && document.activeElement instanceof HTMLInputElement) {
            setLoading(true);

            const input = document.activeElement;
            const index = parseInt(input.dataset?.index);

            const breakpoint = input.selectionStart;
            const breakpointLineNumber = parseInt(input.dataset?.line);

            const beforeBreakpoint = input.value.substring(0, breakpoint);
            const afterBreakpoint = input.value.substring(breakpoint, input.value.length);

            const newSubtitles = [...subtitles];

            const _numLines = parseInt(subtitles[index].numLines);
            if (_numLines < 4) {
                // if there's room to add another line to the subtitle
                const newSubtitle = {
                    ...subtitles[index],
                    numLines: _numLines + 1
                };

                for (let i = 1; i <= 4; i++) {
                    if (breakpointLineNumber + 1 === i) {
                        newSubtitle[`line${i}`] = afterBreakpoint;
                    } else if (breakpointLineNumber < i) {
                        newSubtitle[`line${i}`] = subtitles[index][`line${i - 1}`];
                    } else if (breakpointLineNumber === i) {
                        newSubtitle[`line${i}`] = beforeBreakpoint;
                    } else {
                        newSubtitle[`line${i}`] = subtitles[index][`line${i}`];
                    }
                }

                newSubtitles.splice(index, 1, newSubtitle);
                setCursorPosition({ index, line: breakpointLineNumber + 1, position: 0 });
            } else {
                // if there's no room, create another subtitle
                const duration = subtitles[index].endSec - subtitles[index].startSec;
                const totalChars = subtitles[index].line1.length + subtitles[index].line2.length + subtitles[index].line3.length + subtitles[index].line4.length;
                const ratio = absoluteBreakpoint(subtitles[index], breakpoint, breakpointLineNumber) / totalChars;
                const newTimeSec = subtitles[index].startSec + duration * ratio;

                // calcs the breakpoint considering all chars, of all lines
                function absoluteBreakpoint(subtitle, breakpoint, lineNumber) {
                    let sum = 0;
                    for (let i = 1; i < lineNumber; i++) {
                        sum += subtitle[`line${i}`].length;
                    }
                    return sum + breakpoint;
                }

                const newSubtitleA = new Subtitle({
                    options: {
                        ...subtitles[index],
                        line1: breakpointLineNumber === 1 ? beforeBreakpoint : subtitles[index].line1,
                        line2: breakpointLineNumber === 2 ? beforeBreakpoint : breakpointLineNumber > 2 ? subtitles[index].line2 : '',
                        line3: breakpointLineNumber === 3 ? beforeBreakpoint : breakpointLineNumber > 3 ? subtitles[index].line3 : '',
                        line4: breakpointLineNumber === 4 ? beforeBreakpoint : breakpointLineNumber > 4 ? subtitles[index].line4 : '',
                        numLines: breakpointLineNumber,
                        endSec: newTimeSec
                    }
                });
                const newSubtitleB = new Subtitle({
                    options: {
                        ...subtitles[index],
                        startSec: newTimeSec,
                        line1: afterBreakpoint,
                        line2: subtitles[index][`line${breakpointLineNumber + 1}`] || '',
                        line3: subtitles[index][`line${breakpointLineNumber + 2}`] || '',
                        line4: subtitles[index][`line${breakpointLineNumber + 3}`] || '',
                        numLines: _numLines - breakpointLineNumber + 1
                    }
                });

                newSubtitles.splice(index, 1, newSubtitleA, newSubtitleB);
                setCursorPosition({ index: index + 1, line: 1, position: 0 });
                setSelectedSubtitle(index + 1);
            }

            setSubtitles(newSubtitles);
            setTimeout(() => {
                setLoading(false);
            }, 0);
        }
    }

    function handleBackspace(e) {
        const input = document.activeElement;

        if (input.selectionStart === 0) {
            setLoading(true);

            const index = parseInt(input.dataset?.index);
            const lineNumber = parseInt(input.dataset?.line);
            const newSubtitles = [...subtitles];

            console.log(typeof subtitles[index].numLines, typeof subtitles[index - 1].numLines);
            console.log(lineNumber === 1);
            console.log(subtitles[index].numLines + subtitles[index - 1].numLines);
            if (lineNumber === 1 && (subtitles[index].numLines + subtitles[index - 1].numLines <= 5)) {
                // combine this subtitle with the one before it:
                console.log('merge subtitles path');

                const newNumLines = subtitles[index - 1].numLines + subtitles[index].numLines - 1;
                const combinedSubtitle = new Subtitle({
                    options: {
                        ...subtitles[index - 1],
                        line1: subtitles[index - 1].line1 || '',
                        line2: subtitles[index - 1].line2 || '',
                        line3: subtitles[index - 1].line3 || '',
                        line4: subtitles[index - 1].line4 || '',
                        numLines: newNumLines,
                        startSec: subtitles[index - 1].startSec,
                        endSec: subtitles[index].endSec,
                        confidence: (subtitles[index - 1].confidence + subtitles[index].confidence) / 2
                    }
                });

                if (newNumLines < 4) {
                    console.log('numLines is less than 4 path');
                    for (let i = 0; i < newNumLines; i++) {
                        combinedSubtitle[`line${newNumLines - i + 1}`] += subtitles[index][`line${newNumLines - i - 1}`] || '';
                    }
                    // setCursorPosition({ index: index - 1, line: , position: 0 });
                } else {
                    console.log('numLines is equal to 4 path');
                    for (let i = 0; i < newNumLines; i++) {
                        combinedSubtitle[`line${newNumLines - i}`] += subtitles[index][`line${newNumLines - i - 1}`] || '';
                    }
                }

                // for (let i = 1; i <= 4; i++) {
                //     if (combinedSubtitle[`line${lineNumber + i}`]) {
                //         combinedSubtitle[`line${lineNumber + i}`] = subtitles[index][`line${i}`];
                //     }
                // }



                newSubtitles.splice(index - 1, 2, combinedSubtitle);
                // setCursorPosition({ index: index - 1, line: 1, position: 0 });
                setSelectedSubtitle(index - 1);

            } else {
                // join this line with the one before it:
                console.log('join lines path');

                const newSubtitle = new Subtitle({
                    options: {
                        ...subtitles[index],
                        line1: 'REPLACE',
                        line2: 'REPLACE',
                        line3: 'REPLACE',
                        line4: 'REPLACE'
                    }
                });

                newSubtitles.splice(index, 1, newSubtitle);
            }

            setSubtitles(newSubtitles);
            setTimeout(() => {
                setLoading(false);
            }, 0);
        }
    }

    return (
        <>
            <div>
                <br></br>
                <div>
                    <button onClick={e => addToUndoStack(new HistoryItem({
                        storedStates: [
                            [subtitles, setSubtitles],
                            [loading, setLoading]
                        ]
                    }))}>Add To Undo Stack</button>
                </div>
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
                <p>Selection Type: {selectionScope}</p>
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
            <div>
                {subtitles.map((subtitle, index) => {
                    return (
                        <div onClick={e => handleSubtitleClick(index)} data-selectionscope='1' data-numlines={subtitle.numLines}
                            key={index} className={(selectedSubtitle === index && 'selected-subtitle') + ' border border-black rounded m-2 p-2'}>
                            <div>
                                {!loading && subtitleLineNumbers.map((lineNumber, _index) => {
                                    return (
                                        <InputLine defaultValue={subtitle[`line${lineNumber}`]}
                                            key={_index}
                                            onChange={e => updateLine(e)}
                                            onFocus={e => updateCursorPosition(e)}
                                            index={index} line={lineNumber}
                                            cursorPosition={cursorPosition.index === index && cursorPosition.line === lineNumber ? cursorPosition.position : null}
                                        />
                                    )
                                })}
                            </div>
                            <div>
                                <p>Start: {subtitle.startSec?.toFixed(2)}</p>
                                <p>End: {subtitle?.endSec?.toFixed(2)}</p>
                                <p>Confidence: {(subtitle.confidence * 100).toFixed(2) || '--:--'}%</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
