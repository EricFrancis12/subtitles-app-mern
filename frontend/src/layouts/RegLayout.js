import React from 'react';
import { Container } from 'react-bootstrap';

export function RegLayout({ children }) {
    return (
        <Container className='d-flex align-itmes-center justify-content-center' style={{ minHeight: '100vh' }}>
            <div className='w-100' style={{ maxWidth: '400px' }}>
                {children}
            </div>
        </Container>
    )
}
