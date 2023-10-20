import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container } from 'react-bootstrap';
import AppSidebar from '../components/AppSidebar';
import AppNavbar from '../components/AppNavbar';
import '../assets/scss/AuthLayout.scss';
import useWindowResize from '../hooks/useWindowResize';

export function AuthLayout({ children }) {
    const { loggedIn } = useAuth();

    const [sidebarShow, setSidebarShow] = useState(false);
    const [unfoldable, setUnfoldable] = useState(false);

    useWindowResize(() => {
        setSidebarShow(false);
        setUnfoldable(false);
    });

    return loggedIn
        ? <>
            <div>
                <AppSidebar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} unfoldable={unfoldable} setUnfoldable={setUnfoldable} />
                <div className="wrapper d-flex flex-column min-vh-100 bg-light">
                    <AppNavbar sidebarShow={sidebarShow} setSidebarShow={setSidebarShow} />
                    <div className="body flex-grow-1 px-3 py-4" style={{ backgroundColor: '#ebedef' }}>
                        <Container className='d-flex align-itmes-center justify-content-center'>
                            <div>
                                {children}
                            </div>
                        </Container>
                    </div>
                    {/* <AppFooter /> */}
                </div>
            </div>
        </>
        : <Navigate to='/login' />
}
