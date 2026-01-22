import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        full_name: '' // Changed email to full_name to match backend
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await authService.createStaff({
                username: formData.username,
                password: formData.password,
                full_name: formData.full_name
            });
            setSuccess('Staff account created successfully!');
            // Reset form
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                full_name: ''
            });
        } catch (err) {
            console.error(err);
            setError('Failed to create staff. Username might be taken.');
        }
    };

    return (
        <div className="register-page">
            <div className="card register-card">
                <h1 className="page-title" style={{ textAlign: 'center' }}>Create Staff Account</h1>
                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success" style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>{success}</div>}

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
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            className="form-input"
                            value={formData.full_name}
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
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Staff</button>
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
