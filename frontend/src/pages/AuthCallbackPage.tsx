import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setAuthToken } from '../store/authSlice';
import './AuthCallbackPage.css';

const AuthCallbackPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (token) {
            dispatch(setAuthToken(token));
            navigate('/dashboard');
        } else if (error) {
            console.error('SSO Hiba:', error);
            navigate(`/login?error=${error}`);
        } else {
            navigate('/login?error=unknown_error');
        }
    }, [dispatch, location.search, navigate]);

    return (
        <div className="callback-container">
            <h1>Bejelentkezés feldolgozása...</h1>
            <p>Kérjük, várjon. Hamarosan átirányítjuk a Dashboardra.</p>
        </div>
    );
};

export default AuthCallbackPage;