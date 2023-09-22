import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container } from 'react-bootstrap';
import AppNavbar from '../components/AppNavbar';

export function AuthLayout({ children }) {
    const { loggedIn } = useAuth();

    const navItems = [
        { name: 'Profile', link: '/app/profile' },
        { name: 'Settings', link: '/app/settings' }
    ];

    return loggedIn
        ? <>
            <AppNavbar />
            <Container className='d-flex align-itmes-center justify-content-center' style={{ minHeight: '100vh' }}>
                <div className='w-100' style={{ maxWidth: '400px' }}>
                    {children}
                </div>
            </Container>
        </>
        : <Navigate to='/login' />
}