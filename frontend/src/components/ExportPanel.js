import React, { useState, useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import ffmpegFonts from '../config/ffmpegFonts.json';
import Subtitle from '../models/Subtitle';

const ALLOWED_FILE_EXTS = ['mp4', 'mov', 'mkv', 'flv', 'avi', 'webm', 'wmv'];

export default function ExportPanel(props) {
    const { subtitles, globalStylePanel, selectionScope } = props;

    const [exporting, setExporting] = useState(false);
    const [exportResults, setExportResults] = useState([]);

    const ffmpegRef = useRef(new FFmpeg());
    const fileExtRef = useRef('');

    const loading = useRef(false);
    const loaded = useRef(false);

    const { videoFile, videoInfo } = useVideoUpload();

    useEffect(() => {
        if (!loaded.current && !loading.current) {
            load();
        }
    }, [videoFile]);

    async function load() {
        loading.current = true;
        loaded.current = false;

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
            });

            // create necessary dirs in virtual file system:
            const virtualDirContents = await ffmpeg.listDir('/');
            if (virtualDirContents.findIndex(dir => dir.name === 'fonts') === -1) await ffmpeg.createDir('fonts');

            // write fonts to virtual file system:
            for (let i = 0; i < ffmpegFonts.length; i++) {
                const fontFileData = await fetchFile(`/assets/fonts/${ffmpegFonts[i].fileName}`);
                await ffmpeg.writeFile(`fonts/${ffmpegFonts[i].fileName}`, fontFileData);
            }

            loading.current = false;
            loaded.current = true;
        } catch (err) {
            console.error(err);
        }
    }

    async function handleExportClick() {
        if (!loaded.current) return;
        setExporting(true);

        const timestamp = Date.now();
        const fileExt = fileExtRef.current.value;
        const outputVideoFilePath = `${timestamp}.${fileExt}`;
        const outputSubtitlesFilePath = `${timestamp}.ass`;
        const videoURL = URL.createObjectURL(videoFile);
        let exportResult;

        try {
            // impliment ffmpeg.wasm:
            const ffmpeg = ffmpegRef.current;
            const subtitlesFileData = Subtitle.makeSubtitlesFile({ subtitles, videoInfo, globalStyles: globalStylePanel });

            await ffmpeg.writeFile(outputSubtitlesFilePath, subtitlesFileData);
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoURL));
            await ffmpeg.exec(['-i', `input.mp4`, '-vf', `subtitles=${outputSubtitlesFilePath}:fontsdir=/fonts`, outputVideoFilePath]);

            exportResult = {
                videoFilePath: outputVideoFilePath,
                subtitlesFilePath: outputSubtitlesFilePath,
                videoInfo,
                timestamp
            };
        } catch (err) {
            console.error(err);
        }

        if (exportResult) setExportResults([...exportResults, exportResult]);
        setExporting(false);
    }

    async function downloadFile(vfsFilePath, type) {
        const ffmpeg = ffmpegRef.current;
        const fileExt = vfsFilePath.split('.').at(-1);
        const data = await ffmpeg.readFile(vfsFilePath);
        const blobUrl = URL.createObjectURL(new Blob([data.buffer], { type }));

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${Date.now()}.${fileExt}`;
        a.click();
    }

    return (
        <div data-selectionscope={selectionScope}>
            {exportResults.length > 0
                ? <div>
                    {exportResults.map((exportResult, index) => {
                        const { videoFilePath, subtitlesFilePath, videoInfo, timestamp } = exportResult;
                        const { name, duration } = videoInfo;

                        return (
                            <div key={index}>
                                <p>Video Name: {name}</p>
                                <p>Duration: {duration}</p>
                                <p>Timestamp: {timestamp}</p>
                                <button onClick={e => downloadFile(videoFilePath, 'video/mp4')}>Download Video</button>
                                <button onClick={e => downloadFile(subtitlesFilePath, 'text/plain')}>Download Subtitles File</button>
                            </div>
                        )
                    })}
                </div>
                : ''}
            {exporting
                ? <div>
                    <p>PROGRESS BAR GOES HERE...</p>
                </div>
                : <>
                    <div>
                        {exportResults.map((result, index) => {
                            return (
                                <p key={index}>{JSON.stringify(result)}</p>
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
                    <Button onClick={e => handleExportClick()} data-selectionscope={selectionScope}>Export</Button>
                </>}
        </div>
    )
}
