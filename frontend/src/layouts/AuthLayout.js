import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';

export function AuthLayout({ children }) {
    const { loggedIn } = useAuth();

    return loggedIn
        ? <>
            <AppNavbar />
            <Container className='d-flex align-itmes-center justify-content-center' style={{ minHeight: '100vh' }}>
                <div>
                    {children}
                </div>
            </Container>
        </>
        : <Navigate to='/login' />
}
