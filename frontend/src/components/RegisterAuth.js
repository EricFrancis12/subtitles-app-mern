import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap/esm';
import { Link } from 'react-router-dom';

export default function RegisterAuth() {
    const { emailAuthStr } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError('');
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
                setError(resJson.message || 'Error activating account')
            }
        }).catch(err => {
            setError(err.message || 'Error activating account');
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <div>
            {loading
                ? <Spinner />
                : error
                    ? <div>{error}</div>
                    : <div>
                        <h2>Thank you for confirming your email</h2>
                        <Link to='/login'>Click Here To Login</Link>
                    </div>
            }
        </div>
    )
}
