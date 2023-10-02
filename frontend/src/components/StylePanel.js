import React, { useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import editorOptions from '../config/editorOptions.json';
import ffmpegFonts from '../config/ffmpegFonts.json';

export default function StylePanel(props) {
    const { stylePanel, handleStylePanelChange } = props;

    const fontInputRef = useRef();
    const fontSizeInputRef = useRef();
    const fontColorInputRef = useRef();
    const borderWInputRef = useRef();
    const borderColorInputRef = useRef();
    const backgroundColorInputRef = useRef();
    const boldInputRef = useRef();
    const italicInputRef = useRef();
    const underlineInputRef = useRef();
    const alignInputRef = useRef();

    function handleButtonClick(style, e) {
        const value = Boolean(e.target.dataset.value);
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
        backgroundColorInputRef.current.value = stylePanel.backgroundColor.value;
        boldInputRef.current.value = stylePanel.bold.value;
        italicInputRef.current.value = stylePanel.italic.value;
        underlineInputRef.current.value = stylePanel.underline.value;
        alignInputRef.current.value = stylePanel.align.value;
    }, [stylePanel]);

    return (
        <Form>
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
                <Form.Label>Background Color</Form.Label>
                <Form.Control onChange={e => handleStylePanelChange('backgroundColor', e.target.value)}
                    ref={backgroundColorInputRef} type='color' defaultValue={stylePanel.backgroundColor.value}></Form.Control>
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
        </Form>
    )
}
