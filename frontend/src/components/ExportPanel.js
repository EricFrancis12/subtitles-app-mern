import React, { useState, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';

const ALLOWED_FILE_EXTS = ['mp4', 'mov', 'mkv', 'flv', 'avi', 'webm', 'wmv'];

export default function ExportPanel(props) {
    const { subtitles } = props;

    const [exporting, setExporting] = useState(false);
    const [exportResults, setExportResults] = useState([]);

    const fileExtRef = useRef();

    async function handleExportClick() {
        const fileExt = fileExtRef.current.value;
        setExporting(true);

        // impliment ffmpeg.wasm here...

        setExporting(false);
        setExportResults([...exportResults, /* new export goes here */]);
    }

    return (
        <div>
            {exporting
                ? <div>
                    <p>PROGRESS BAR GOES HERE...</p>
                </div>
                : <>
                    <div>
                        {exportResults.map(result => {
                            return (
                                <p>{JSON.stringify(result)}</p>
                            )
                        })}
                    </div>
                    <Form>
                        <Form.Label>Select File Type</Form.Label>
                        <Form.Select ref={fileExtRef}>
                            {ALLOWED_FILE_EXTS.map((option, index) => {
                                return (
                                    <option value={option} key={index}>{option}</option>
                                )
                            })}
                        </Form.Select>
                    </Form>
                    <Button onClick={e => handleExportClick()}>Export</Button>
                </>}
        </div>
    )
}
