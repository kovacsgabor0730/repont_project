import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { clearAuthToken } from '../store/authSlice';
import api from '../api/axiosClient';
import type { RootState } from '../store/store';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const authToken = useAppSelector((state: RootState) => state.auth.authToken);

    const handleLogout = async () => {
        try {
            if (authToken) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error('Hiba a kijelentkezés API hívásánál:', error);
        } finally {
            dispatch(clearAuthToken());

            navigate('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            style={buttonStyle}
        >
            Kilépés 🚪
        </button>
    );
};

const buttonStyle: React.CSSProperties = {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
};

export default LogoutButton;