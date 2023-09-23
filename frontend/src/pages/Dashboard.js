import React, { useState, useEffect } from 'react';
import { Form, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { useVideoUpload } from '../contexts/VideoUploadContext';
import { useSubtitles } from '../contexts/SubtitlesContext';
import { useEditor } from '../contexts/EditorContext';
import defaultEditorSettings from '../config/defaultEditorSettings.json';
import editorOptions from '../config/editorOptions.json';

export default function Dashboard() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoSrc, setVideoSrc] = useState('');

    const navigate = useNavigate();

    const { userClient } = useAuth;
    const { videoFile, setVideoFile, handleFileUpload, videoInfo, setVideoInfo, handleVideoLoaded } = useVideoUpload();
    const { subtitlesData, setSubtitlesData, transcribeVideo } = useSubtitles();
    const { editorSettings, setEditorSettings, applyEditorSettingsGlobally } = useEditor();

    const numLinesoptions = editorOptions.numLines;
    const numWordsPerLineOptions = editorOptions.numWordsPerLine;

    const defaultForm = {
        numLines: userClient.defaultEditorSettings.numLines || defaultEditorSettings.numLines,
        numWordsPerLine: userClient.defaultEditorSettings.numWordsPerLine || defaultEditorSettings.numWordsPerLine
    };

    const [formData, setFormData] = useState({ ...defaultForm });

    useEffect(() => {
        if (videoFile) {
            const videoURL = URL.createObjectURL(videoFile);
            setVideoSrc(videoURL);
        }
    }, [videoFile]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await transcribeVideo(videoFile);
            setEditorSettings({ ...editorSettings, numLines: formData.numLines, numWordsPerLine: formData.numWordsPerLine })
            applyEditorSettingsGlobally();

            navigate('/app/editor');
        } catch (err) {
            setError(err.message || 'Failed to transcribe video');
        }

        setLoading(false);
    }

    function handleReset() {
        setVideoFile(null);
        setFormData({ ...defaultForm });
    }

    useEffect(() => {
        console.log('running setFormData() because videoFile.name changed');
        setFormData({ ...defaultForm });
    }, [videoFile?.name]);

    return (
        <>
            <Card>
                {error && <Alert variant='danger'>{error}</Alert>}
                {videoFile
                    ? <Card.Body>
                        <div className='d-flex flex-column gap-4 justify-items-between align-items-center'>
                            <div>
                                <video onLoadedMetadata={e => handleVideoLoaded(e)} src={videoSrc} style={{ maxHeight: '400px', maxWidth: '400px' }}></video>
                            </div>
                            <div>
                                <h4>Video Info:</h4>
                                <p>Name: {videoInfo?.name}</p>
                                <p>Duration: {videoInfo?.durFormatted}</p>
                            </div>
                            <div>
                                <h4>Options:</h4>
                                <Form onSubmit={e => handleSubmit(e)}>
                                    {loading || subtitlesData
                                        ? ''
                                        : <>
                                            <Form.Group id='numLines'>
                                                <Form.Label>Number of Lines</Form.Label>
                                                <Form.Select onChange={(e) => setFormData({ ...formData, numLines: e.target.value })}>
                                                    {numLinesoptions.map((option, index) => <option key={index}>{option}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group id='numWordsPerLine'>
                                                <Form.Label>Number of Words Per Line</Form.Label>
                                                <Form.Select onChange={(e) => setFormData({ ...formData, numWordsPerLine: e.target.value })}>
                                                    {numWordsPerLineOptions.map((option, index) => <option key={index}>{option}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                        </>}
                                    {loading
                                        ? <Spinner />
                                        : subtitlesData
                                            ? <Link to='/app/editor'>Go to Editor</Link>
                                            : <Button disabled={loading || subtitlesData} className='w-100 mt-4' type='submit'>Transcribe Video</Button>}
                                </Form>
                            </div>
                            <Button onClick={e => handleReset()} className='btn btn-brimary'>Reset</Button>
                        </div>
                    </Card.Body>
                    : <Card.Body style={{ height: '500px' }}>
                        <div className='h-100 w-100'>
                            <label className='input-hover h-100 w-100 d-flex flex-column justify-content-center align-items-center rounded'>
                                <h2><FontAwesomeIcon icon={faUpload} className="cursor-pointer" /> Upload a Video File</h2>
                                <input type='file' accept='accept="video/*' onChange={e => handleFileUpload(e)} className='d-none'></input>
                            </label>
                        </div>
                    </Card.Body>}
            </Card>
        </>
    )
}
