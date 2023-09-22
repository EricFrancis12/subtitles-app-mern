import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
    const { register } = useAuth();

    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [registrationInitialized, setRegistrationInitialized] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value || passwordRef.current.value === '') {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            setMessage('');
            await register(emailRef.current.value, passwordRef.current.value);
            setRegistrationInitialized(true);
            setMessage('We are sending you an activation email now. Please click the link in the email to activate your account.');
        } catch (err) {
            setError(err.message || 'Failed to create an account');
        }

        setLoading(false);
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className='text-center mb-4'>Sign Up</h2>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    {message && <Alert variant='success'>{message}</Alert>}
                    <Form onSubmit={e => handleSubmit(e)}>
                        <Form.Group id='email'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id='password'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' ref={passwordRef} required />
                        </Form.Group>
                        <Form.Group id='password-confirm'>
                            <Form.Label>Password Confirmation</Form.Label>
                            <Form.Control type='password' ref={passwordConfirmRef} required />
                        </Form.Group>
                        <Button disabled={loading || registrationInitialized} className='w-100 mt-4' type='submit'>Sign Up</Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className='w-100 text-center mt-2'>
                Already have an account? <Link to='/login'>Log In</Link>
            </div>
        </>
    )
}
