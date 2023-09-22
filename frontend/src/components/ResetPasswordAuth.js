import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap/esm';

export default function ResetPasswordAuth() {
    const { resetPasswordAuthStr } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError('');

        if (resetPasswordAuthStr) {
            setLoading(true);

            fetch('/password/reset/auth', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    resetPasswordAuthStr
                })
            }).then(async (res) => {
                const resJson = await res.json();
                if (resJson.success === false) {
                    setError('1' || resJson.message || 'Error resetting password');
                }
            }).catch(err => {
                setError('2' || err.message || 'Error resetting password');
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setError('Invalid link');
        }
    }, [resetPasswordAuthStr]);

    return (
        <div>
            {loading
                ? <Spinner />
                : error
                    ? <div>{error}</div>
                    : <Navigate to='/password/reset/enter-new-password' />
            }
        </div>
    )
}
