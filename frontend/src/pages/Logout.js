import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Logout() {
    const { logout } = useAuth();

    useEffect(() => {
        const controller = new AbortController();

        logout(controller.signal)
            .catch(err => { });

        return () => controller.abort();
    }, []);

    return (
        <Navigate to='/login' />
    )
}
