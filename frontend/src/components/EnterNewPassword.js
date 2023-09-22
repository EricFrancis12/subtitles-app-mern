import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function EnterNewPassword() {
    const { setNewPassword } = useAuth();

    const passwordRef = useRef();
    const passwordConfirmRef = useRef();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value || passwordRef.current.value === '') {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            setMessage('');
            await setNewPassword(passwordRef.current.value, passwordConfirmRef.current.value);
            setMessage('New password set. Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (err) {
            setError(err.message || 'Failed to set new password');
        }

        setLoading(false);
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Set New Password</h2>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {message && <Alert variant='success'>{message}</Alert>}
                    <Form onSubmit={e => handleSubmit(e)}>
                        <Form.Group id='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' ref={passwordRef} required />
                        </Form.Group>
                        <Form.Group id='password-confirm'>
                            <Form.Label>Password Confirmation</Form.Label>
                            <Form.Control type='password' ref={passwordConfirmRef} required />
                        </Form.Group>
                        <Button disabled={loading} className='w-100 mt-4' type='submit'>Set Password</Button>
                    </Form>
                </Card.Body>
            </Card>
        </>
    )
}
