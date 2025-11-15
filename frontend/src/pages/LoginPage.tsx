import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                email,
                password,
            });

            const token = response.data.token;

            localStorage.setItem('authToken', token);

            console.log('Sikeres bejelentkezés, token elmentve:', token);
            window.location.href = '/dashboard';

        } catch (err) {
            console.error('Login hiba:', err);
            if (axios.isAxiosError(err) && err.response) {
                setError('Hiba a bejelentkezés során. Ellenőrizd az adatokat.');
            } else {
                setError('Hálózati hiba történt.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
            <h2>Bejelentkezés</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={{ marginBottom: 10 }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Jelszó:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>

                <button type="submit" disabled={isLoading} style={{ padding: 10 }}>
                    {isLoading ? 'Betöltés...' : 'Bejelentkezés'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;