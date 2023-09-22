import React, { useState, useEffect, useRef } from 'react';
import { Form, Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { useVideoUpload } from '../contexts/VideoUploadContext';

export default function Dashboard() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [videoSrc, setVideoSrc] = useState('');

    const { videoFile, setVideoFile, handleFileUpload, videoInfo, setVideoInfo, handleVideoLoaded, transcribeVideo } = useVideoUpload();

    const languageOptions = ['English', 'Spanish', 'French'];
    const numLinesoptions = ['1', '2', '3', '4'];
    const numWordsPerLineOptions = ['1', '2', '3', '4', '5'];

    const [formData, setFormData] = useState({
        language: languageOptions[0],
        numLines: numLinesoptions[0],
        numWordsPerLine: numWordsPerLineOptions[0]
    });

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
            setMessage('');
            await transcribeVideo(formData);
            setMessage('Video transcribed successfully');
        } catch (err) {
            setError(err.message || 'Failed to transcribe video');
        }

        setLoading(false);
    }

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
                                    <Form.Group id='language'>
                                        <Form.Label>Language</Form.Label>
                                        <Form.Select onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                                            {languageOptions.map((option, index) => <option key={index}>{option}</option>)}
                                        </Form.Select>
                                    </Form.Group>
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
                                    <Button disabled={loading} className='w-100 mt-4' type='submit'>Transcribe Video</Button>
                                </Form>
                            </div>
                            <Button onClick={e => setVideoFile(null)} className='btn btn-brimary'>Reset</Button>
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
