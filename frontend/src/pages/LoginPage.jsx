import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.login(formData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                setTimeout(() => {
                    navigate('/dashboard');
                }, 300);
            } else {
                setError('Đăng nhập thất bại: Không nhận được token');
            }
        } catch (err) {
            console.error(err);
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="branding-content">
                    <div className="logo-section">
                        <div className="logo-icon">📦</div>
                        <h1 className="brand-name">WMS <span className="brand-pro">Pro</span></h1>
                    </div>
                    <h2 className="brand-tagline">Warehouse Management System</h2>
                    <p className="brand-description">
                        Hệ thống quản lý kho hàng thông minh, tối ưu hóa quy trình nhập xuất và theo dõi tồn kho
                    </p>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">✓</div>
                            <span>Quản lý tồn kho thời gian thực</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">✓</div>
                            <span>Gợi ý FIFO thông minh</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">✓</div>
                            <span>Báo cáo chi tiết & xuất Excel</span>
                        </div>
                    </div>
                </div>
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <div className="login-header">
                        <div className="header-icon">🔐</div>
                        <h2 className="login-title">Đăng nhập</h2>
                        <p className="login-subtitle">Chào mừng bạn quay lại hệ thống</p>
                    </div>

                    {error && (
                        <div className="alert-error">
                            <span className="error-icon">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Tên đăng nhập</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    placeholder="Nhập tên đăng nhập của bạn"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Nhập mật khẩu của bạn"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-login ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                <>
                                    <span>Đăng nhập</span>
                                    <span className="arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <div className="divider">
                            <span>hoặc</span>
                        </div>
                        <p className="footer-text">
                            <span className="info-icon">ℹ️</span>
                            <span>Liên hệ quản trị viên để tạo tài khoản</span>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                * {
                    box-sizing: border-box;
                }

                .login-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }

                /* Left Side - Branding */
                .login-left {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    position: relative;
                    overflow: hidden;
                }

                .branding-content {
                    position: relative;
                    z-index: 2;
                    color: white;
                    max-width: 500px;
                    width: 100%;
                }

                .logo-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                    animation: fadeInUp 0.8s ease-out;
                }

                .logo-icon {
                    font-size: 4rem;
                    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
                    animation: bounce 2s ease-in-out infinite;
                }

                .brand-name {
                    font-size: 3.5rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -2px;
                    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
                }

                .brand-pro {
                    background: linear-gradient(135deg, #38bdf8 0%, #22d3ee 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .brand-tagline {
                    font-size: 1.375rem;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 1.25rem;
                    opacity: 0.95;
                    animation: fadeInUp 0.8s ease-out 0.2s both;
                    letter-spacing: 0.5px;
                }

                .brand-description {
                    font-size: 1.0625rem;
                    line-height: 1.7;
                    text-align: center;
                    opacity: 0.9;
                    margin-bottom: 3rem;
                    animation: fadeInUp 0.8s ease-out 0.4s both;
                }

                .features-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding: 0 2rem;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: fadeInUp 0.8s ease-out calc(0.6s + var(--delay, 0s)) both;
                    transition: all 0.3s ease;
                }

                .feature-item:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateX(8px);
                }

                .feature-item:nth-child(1) { --delay: 0s; }
                .feature-item:nth-child(2) { --delay: 0.1s; }
                .feature-item:nth-child(3) { --delay: 0.2s; }

                .feature-icon {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.875rem;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .feature-item span {
                    font-size: 1rem;
                    font-weight: 500;
                }

                /* Decorative Circles */
                .decoration-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(2px);
                }

                .circle-1 {
                    width: 400px;
                    height: 400px;
                    top: -150px;
                    right: -150px;
                    animation: float 8s ease-in-out infinite;
                }

                .circle-2 {
                    width: 250px;
                    height: 250px;
                    bottom: -80px;
                    left: -80px;
                    animation: float 10s ease-in-out infinite 2s;
                }

                .circle-3 {
                    width: 180px;
                    height: 180px;
                    top: 40%;
                    right: 10%;
                    animation: float 12s ease-in-out infinite 4s;
                }

                /* Right Side - Login Form */
                .login-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    background: #f8fafc;
                }

                .login-card {
                    width: 100%;
                    max-width: 500px;
                    background: white;
                    padding: 3.5rem;
                    border-radius: 20px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideInRight 0.8s ease-out;
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .header-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    animation: fadeInUp 0.6s ease-out;
                }

                .login-title {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.5px;
                }

                .login-subtitle {
                    font-size: 1rem;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }

                .alert-error {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #991b1b;
                    padding: 1rem 1.25rem;
                    border-radius: 12px;
                    margin-bottom: 1.75rem;
                    border: 1px solid #fca5a5;
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    animation: shake 0.5s ease-out;
                    font-size: 0.9375rem;
                    font-weight: 500;
                }

                .error-icon {
                    font-size: 1.375rem;
                    flex-shrink: 0;
                }

                .login-form {
                    margin-bottom: 2rem;
                }

                .form-group {
                    margin-bottom: 1.75rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 0.625rem;
                    letter-spacing: 0.2px;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1.125rem;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.25rem;
                    opacity: 0.4;
                    pointer-events: none;
                    z-index: 1;
                }

                .form-input {
                    width: 100%;
                    padding: 1rem 1.125rem 1rem 3.25rem;
                    font-size: 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    background: #f8fafc;
                    color: #1e293b;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 500;
                }

                .form-input::placeholder {
                    color: #94a3b8;
                    font-weight: 400;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #667eea;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                }

                .form-input:focus + .input-icon {
                    opacity: 0.6;
                }

                .form-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: #f1f5f9;
                }

                .btn-login {
                    width: 100%;
                    padding: 1.125rem 1.5rem;
                    font-size: 1.0625rem;
                    font-weight: 700;
                    color: white;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.625rem;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    margin-top: 2rem;
                    letter-spacing: 0.3px;
                }

                .btn-login:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                .btn-login:active:not(:disabled) {
                    transform: translateY(-1px);
                }

                .btn-login:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }

                .btn-login .arrow {
                    font-size: 1.375rem;
                    transition: transform 0.3s ease;
                }

                .btn-login:hover:not(:disabled) .arrow {
                    transform: translateX(4px);
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2.5px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                .login-footer {
                    margin-top: 2rem;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 1.75rem 0 1.5rem;
                    color: #94a3b8;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e2e8f0;
                }

                .divider span {
                    padding: 0 1rem;
                }

                .footer-text {
                    font-size: 0.9375rem;
                    color: #64748b;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.625rem;
                    font-weight: 500;
                }

                .info-icon {
                    font-size: 1.125rem;
                }

                /* Animations */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-12px);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    33% {
                        transform: translate(15px, -15px) rotate(5deg);
                    }
                    66% {
                        transform: translate(-10px, 10px) rotate(-5deg);
                    }
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .login-left {
                        display: none;
                    }
                    
                    .login-right {
                        padding: 2rem;
                    }
                }

                @media (max-width: 640px) {
                    .login-right {
                        padding: 1.5rem;
                    }

                    .login-card {
                        padding: 2.5rem 2rem;
                    }

                    .login-title {
                        font-size: 1.875rem;
                    }

                    .brand-name {
                        font-size: 2.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
