import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(formData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Also store user info if available
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                navigate('/dashboard');
            } else {
                setError('Login failed: No token received');
            }
        } catch (err) {
            console.error(err);
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-page">
            <div className="card login-card">
                <h1 className="page-title" style={{ textAlign: 'center' }}>Welcome Back</h1>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register here</Link>
                    </div>
                </form>
            </div>
            <style>{`
                .login-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 80vh;
                }
                .login-card {
                    width: 100%;
                    max-width: 400px;
                }
                .alert-error {
                    background-color: rgba(239, 68, 68, 0.2);
                    color: #fca5a5;
                    padding: 0.75rem;
                    border-radius: 6px;
                    margin-bottom: 1rem;
                    text-align: center;
                    border: 1px solid rgba(239, 68, 68, 0.4);
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
