import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await authService.register({
                username: formData.username,
                password: formData.password,
                email: formData.email
            });
            // Redirect to login after successful registration
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            console.error(err);
            setError('Registration failed. Username or email might be taken.');
        }
    };

    return (
        <div className="register-page">
            <div className="card register-card">
                <h1 className="page-title" style={{ textAlign: 'center' }}>Create Account</h1>
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
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
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
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register</button>

                    <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login here</Link>
                    </div>
                </form>
            </div>
            <style>{`
                .register-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 80vh;
                }
                .register-card {
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

export default RegisterPage;
