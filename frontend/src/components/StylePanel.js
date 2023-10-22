import React, { useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import editorOptions from '../config/editorOptions.json';
import defaultEditorSettings from '../config/defaultEditorSettings.json';
import ffmpegFonts from '../config/ffmpegFonts.json';
import { useSubtitles } from '../contexts/SubtitlesContext';

export const DEFAULT_STYLE_PANEL = {
    font: { name: 'Font', value: defaultEditorSettings.font },
    fontSize: { name: 'Font Size', value: defaultEditorSettings.fontSize },
    fontColor: { name: 'Font Color', value: defaultEditorSettings.fontColor },
    borderW: { name: 'Border Width', value: defaultEditorSettings.borderW },
    borderColor: { name: 'Border Color', value: defaultEditorSettings.borderColor },
    backgroundColor: { name: 'Background Color', value: defaultEditorSettings.backgroundColor },
    bold: { name: 'Bold', value: defaultEditorSettings.bold },
    italic: { name: 'Italic', value: defaultEditorSettings.italic },
    underline: { name: 'Underline', value: defaultEditorSettings.underline },
    align: { name: 'Align', value: defaultEditorSettings.align }
};

export default function StylePanel(props) {
    const { stylePanel, handleStylePanelChange, selectionScope, handleUndo, handleRedo } = props;
    const { numLines: numLinesOptions, numWordsPerLine: numWordsPerLineOptions } = editorOptions;

    const { numLines, setNumLines, numWordsPerLine, setNumWordsPerLine } = useSubtitles();

    const fontInputRef = useRef();
    const fontSizeInputRef = useRef();
    const fontColorInputRef = useRef();
    const borderWInputRef = useRef();
    const borderColorInputRef = useRef();
    const boldInputRef = useRef();
    const italicInputRef = useRef();
    const underlineInputRef = useRef();
    const alignInputRef = useRef();

    function handleButtonClick(style, e) {
        const value = Boolean(JSON.parse(e.target.dataset.value));
        const newValue = !value;
        e.target.dataset.value = newValue;
        handleStylePanelChange(style, newValue);
    }

    useEffect(() => {
        fontInputRef.current.value = stylePanel.font.value;
        fontSizeInputRef.current.value = stylePanel.fontSize.value;
        fontColorInputRef.current.value = stylePanel.fontColor.value;
        borderWInputRef.current.value = stylePanel.borderW.value;
        borderColorInputRef.current.value = stylePanel.borderColor.value;
        boldInputRef.current.value = stylePanel.bold.value;
        italicInputRef.current.value = stylePanel.italic.value;
        underlineInputRef.current.value = stylePanel.underline.value;
        alignInputRef.current.value = stylePanel.align.value;
    }, [stylePanel]);

    return (
        <div data-selectionscope={selectionScope}>
            <div className='d-flex w-100 my-4'>
                <Button onClick={e => handleUndo()}>Undo</Button>
                <Button onClick={e => handleRedo()}>Redo</Button>
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
            <div className='d-flex w-100 my-4'>
                <Form.Group>
                    <Form.Label>Font</Form.Label>
                    <Form.Select onChange={e => handleStylePanelChange('font', e.target.value)}
                        ref={fontInputRef} defaultValue={stylePanel.font.value}>
                        {ffmpegFonts.map((font, index) => (
                            <option value={font.family} key={index}>
                                {font.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Font Size</Form.Label>
                    <Form.Select onChange={e => handleStylePanelChange('fontSize', e.target.value)}
                        ref={fontSizeInputRef} defaultValue={stylePanel.fontSize.value}>
                        {editorOptions.fontSize.map((option, index) => (
                            <option value={option} key={index}>
                                {option}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Font Color</Form.Label>
                    <Form.Control onChange={e => handleStylePanelChange('fontColor', e.target.value)}
                        ref={fontColorInputRef} type='color' defaultValue={stylePanel.fontColor.value}></Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Border Width</Form.Label>
                    <Form.Select onChange={e => handleStylePanelChange('borderW', e.target.value)}
                        ref={borderWInputRef} defaultValue={stylePanel.borderW.value}>
                        {editorOptions.borderW.map((option, index) => (
                            <option value={option} key={index}>
                                {option}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Border Color</Form.Label>
                    <Form.Control onChange={e => handleStylePanelChange('borderColor', e.target.value)}
                        ref={borderColorInputRef} type='color' defaultValue={stylePanel.borderColor.value}></Form.Control>
                </Form.Group>
                <Form.Group>
                    <Button onClick={e => handleButtonClick('bold', e)}
                        ref={boldInputRef} data-value={stylePanel.bold.value}>Bold</Button>
                </Form.Group>
                <Form.Group>
                    <Button onClick={e => handleButtonClick('italic', e)}
                        ref={italicInputRef} data-value={stylePanel.italic.value}>Italic</Button>
                </Form.Group>
                <Form.Group>
                    <Button onClick={e => handleButtonClick('underline', e)}
                        ref={underlineInputRef} data-value={stylePanel.underline.value}>Underline</Button>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Align</Form.Label>
                    <Form.Select onChange={e => handleStylePanelChange('align', e.target.value)}
                        ref={alignInputRef} defaultValue={stylePanel.align.value}>
                        {editorOptions.align.map((option, index) => (
                            <option value={option} key={index}>
                                {option}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </div>
        </div >
    )
}
