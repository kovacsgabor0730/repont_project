import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAppDispatch } from '../hooks';
import { setAuthToken } from '../store/authSlice';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.title = 'Login';
    }, []);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await api.post<{ token: string }>('/login', { email, password });
            dispatch(setAuthToken(response.data.token));
            navigate('/dashboard');
        } catch (err) {
            console.error('Login hiba:', err);
            setError('Hibás felhasználónév vagy jelszó. Ellenőrizd az adatokat!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Bejelentkezés 🔐</h2>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <p className="login-error">{error}</p>}

                <div className="login-input-group">
                    <label className="login-label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="login-input"
                    />
                </div>

                <div className="login-input-group">
                    <label className="login-label">Jelszó:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="login-input"
                    />
                </div>

                <button type="submit" disabled={isLoading} className="login-button">
                    {isLoading ? 'Betöltés...' : 'Bejelentkezés'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;