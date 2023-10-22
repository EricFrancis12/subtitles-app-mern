import React, { useState, useEffect } from 'react';
import Editor from './Editor';
import { Form, Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTextHeight, faTextWidth, faPencilSquare, faUndo } from '@fortawesome/free-solid-svg-icons';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import { useSubtitles } from '../contexts/SubtitlesContext';
import editorOptions from '../config/editorOptions.json';
import Spinner from '../components/Spinner';

export default function Dashboard() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoSrc, setVideoSrc] = useState('');

    const { videoFile, setVideoFile, handleFileUpload, videoInfo, setVideoInfo } = useVideoUpload();
    const { subtitlesData, setSubtitlesData, numLines, setNumLines, numWordsPerLine, setNumWordsPerLine, transcribeVideo } = useSubtitles();

    const {numLines: numLinesOptions, numWordsPerLine: numWordsPerLineOptions} = editorOptions;

    const defaultForm = {
        numLines: numLines,
        numWordsPerLine: numWordsPerLine
    };

    const [formData, setFormData] = useState({ ...defaultForm });

    useEffect(() => {
        if (videoFile) {
            const videoURL = URL.createObjectURL(videoFile);
            setVideoSrc(videoURL);
        }
    }, [videoFile]);

    useEffect(() => {
        setFormData({ ...defaultForm });
    }, [videoFile?.name]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 0);
    }, [numLines, numWordsPerLine]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await transcribeVideo();

            setNumLines(formData.numLines);
            setNumWordsPerLine(formData.numWordsPerLine);
        } catch (err) {
            setError(err.message || 'Failed to transcribe video');
        }

        setLoading(false);
    }

    function handleReset() {
        setVideoFile(null);
        setFormData({ ...defaultForm });
    }

    return (
        <>
            {videoFile && subtitlesData
                ? loading
                    ? <Spinner />
                    : <>
                        <Button onClick={e => handleReset()} className='btn btn-brimary'>Reset</Button>
                        <Editor />
                    </>
                : <Card>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {videoFile
                        ? <Card.Body>
                            <div className='d-flex gap-4 flex-column justify-items-between'>
                                <div className='d-flex justify-items-around align-items-center flex-column' style={{ height: 'auto', width: '400px', maxHeight: '400px', maxWidth: '90vw' }}>
                                    <div className='p-3' style={{ height: '100%', width: '100%' }}>
                                        <p className='text-center w-100'>
                                            {videoInfo?.name}
                                        </p>
                                    </div>
                                    <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}>
                                        <div className='position-relative d-flex justify-content-center align-items-center' style={{ height: '90%', width: '90%' }}>
                                            <video src={videoSrc} className='rounded' style={{ maxHeight: '350px', maxWidth: '100%' }}></video>
                                            <span className='position-absolute mx-1 px-1 rounded' style={{ bottom: 0, right: 0, color: 'white', backgroundColor: 'black', opacity: 0.85 }}>
                                                {videoInfo?.durFormatted}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {loading
                                        ? <Spinner />
                                        : <div className='rounded p-4' style={{ backgroundColor: '#ebedef', border: 'solid black 1px' }}>
                                            <Form onSubmit={e => handleSubmit(e)}>
                                                {subtitlesData
                                                    ? ''
                                                    : <div className='d-flex flex-column gap-2'>
                                                        <Form.Group id='numLines'>
                                                            <Form.Label><FontAwesomeIcon icon={faTextHeight} color='blue' /> Number of Lines</Form.Label>
                                                            <Form.Select className='w-100'
                                                                onChange={(e) => setFormData({ ...formData, numLines: e.target.value })}>
                                                                {numLinesOptions.map((option, index) => <option key={index}>{option}</option>)}
                                                            </Form.Select>
                                                        </Form.Group>
                                                        <Form.Group id='numWordsPerLine'>
                                                            <Form.Label><FontAwesomeIcon icon={faTextWidth} color='blue' /> Number of Words Per Line</Form.Label>
                                                            <Form.Select className='w-100'
                                                                onChange={(e) => setFormData({ ...formData, numWordsPerLine: e.target.value })}>
                                                                {numWordsPerLineOptions.map((option, index) => <option key={index}>{option}</option>)}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </div>}
                                                <Button disabled={loading || subtitlesData} className='w-100 mt-4' type='submit'>
                                                    <FontAwesomeIcon icon={faPencilSquare} color='white' /> Transcribe Video
                                                </Button>
                                            </Form>
                                            <div className='d-flex justify-content-center align-items-center w-100 mt-3'>
                                                <Button onClick={e => handleReset()} className='btn btn-brimary w-100'>
                                                    <FontAwesomeIcon icon={faUndo} color='white' /> Reset
                                                </Button>
                                            </div>
                                        </div>}
                                </div>
                            </div>
                        </Card.Body>
                        : <Card.Body style={{ height: '70vh' }}>
                            <div className='h-100 w-100'>
                                <label className='input-hover h-100 w-100 d-flex flex-column justify-content-center align-items-center rounded px-4'>
                                    <h2 className='text-center'>
                                        <FontAwesomeIcon icon={faUpload} className="cursor-pointer text-center" /> Upload a Video File
                                    </h2>
                                    <input type='file' accept='accept="video/*' onChange={e => handleFileUpload(e)} className='d-none'></input>
                                </label>
                            </div>
                        </Card.Body>}
                </Card >}
        </>
    )
}
