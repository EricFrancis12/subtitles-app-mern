import React, { useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

let fetchingUserClient = false;

export function AuthProvider({ children }) {
    const [loggedIn, setLoggedIn] = useState(Cookies.get('loggedIn') === 'true' ? true : false);
    const [userClient, setUserClient] = useState(null);

    useEffect(() => {
        fetchUserClient();
    }, [loggedIn]);

    function fetchUserClient() {
        if (loggedIn && !userClient && !fetchingUserClient) {
            fetchingUserClient = true;
            fetch('/user')
                .then(async (res) => {
                    const resJson = await res.json();
                    if (resJson.userClient) {
                        setUserClient(resJson.userClient);
                    }
                }).catch(err => {

                }).finally(() => {
                    fetchingUserClient = false;
                });
        }
    }

    function handleAuthEvent(data) {
        if (data.loggedIn === true) {
            setLoggedIn(true);
            Cookies.set('loggedIn', 'true', { expires: 7, path: '/' });

            if (data.userClient) setUserClient(data.userClient);
        } else if (data.loggedIn === false) {
            setLoggedIn(false);
            Cookies.remove('loggedIn');
        }
    }

    async function pingServer(url = '', body = {}, method = 'POST') {
        if (!url) throw new Error('No url provided');

        return await new Promise((resolve, reject) => {
            const headers = method.toUpperCase() !== 'GET'
                ? { 'Content-Type': 'application/json' }
                : undefined;

            fetch(url, {
                headers,
                method,
                body: JSON.stringify(body)
            }).then(async (res) => {
                const data = await res.json();
                handleAuthEvent(data);

                if (data.success === false) {
                    reject(data);
                }
                resolve(data);
            }).catch(err => reject(err));
        });
    }

    async function register(email, password) {
        return await pingServer('/register', { email, password });
    }

    async function login(email, password) {
        return await pingServer('/login', { email, password });
    }

    async function logout() {
        const prom = pingServer('/logout', {});
        Cookies.remove('loggedIn');
        setLoggedIn(false);
        setUserClient(null);
        return await prom;
    }

    async function initResetPassword(email) {
        return await pingServer('/password/reset', { email });
    }

    async function setNewPassword(password, confPassword) {
        return await pingServer('/password/reset/enter-new-password', { password, confPassword }, 'PATCH');
    }

    async function changePassword(password, confPassword) {
        return await pingServer('/password/change', { password, confPassword }, 'PATCH');
    }

    async function updateSettings(args) {
        return await pingServer('/settings', args, 'PATCH');
    }

    const value = {
        loggedIn,
        userClient,
        setUserClient,
        fetchUserClient,
        register,
        login,
        logout,
        initResetPassword,
        setNewPassword,
        changePassword,
        updateSettings
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
