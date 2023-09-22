import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap/esm';

export default function RegisterAuth() {
    const { emailAuthStr } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError('');

        if (emailAuthStr) {
            console.log(emailAuthStr);
            setLoading(true);

            fetch('/register/auth', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    emailAuthStr
                })
            }).then(async (res) => {
                const resJson = await res.json();
                if (resJson.success === false) {
                    setError(resJson.message || 'Error activating account');
                }
            }).catch(err => {
                setError(err.message || 'Error activating account');
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setError('Invalid link');
        }
    }, []);

    return (
        <div>
            {loading
                ? <Spinner />
                : error
                    ? <div>{error}</div>
                    : <Navigate to='/login' />
            }
        </div>
    )
}
