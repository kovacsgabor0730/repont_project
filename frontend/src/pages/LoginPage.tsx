import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAppDispatch } from '../hooks';
import { setAuthToken } from '../store/authSlice';

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

            const response = await api.post<{ token: string }>('/login', {
                email,
                password,
            });

            const token = response.data.token;
            dispatch(setAuthToken(token));

            console.log('Sikeres bejelentkezés.');

            navigate('/dashboard');

        } catch (err) {
            console.error('Login hiba:', err);
            setError('Hibás felhasználónév vagy jelszó. Ellenőrizd az adatokat!');

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h2>Bejelentkezés 🔐</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                {error && <p style={errorStyle}>{error}</p>}

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        style={inputStyle}
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Jelszó:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={inputStyle}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={buttonStyle}
                >
                    {isLoading ? 'Betöltés...' : 'Bejelentkezés'}
                </button>
            </form>
        </div>
    );
};

const containerStyle: React.CSSProperties = {
    padding: 20,
    maxWidth: 400,
    margin: '100px auto',
    border: '1px solid #ccc',
    borderRadius: 8,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};
const formStyle: React.CSSProperties = { marginTop: 20 };
const inputGroupStyle: React.CSSProperties = { marginBottom: 15 };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 5, fontWeight: 'bold' };
const inputStyle: React.CSSProperties = { width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' };
const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: 10,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer'
};
const errorStyle: React.CSSProperties = { color: 'red', backgroundColor: '#fdd', padding: 10, borderRadius: 4 };


export default LoginPage;