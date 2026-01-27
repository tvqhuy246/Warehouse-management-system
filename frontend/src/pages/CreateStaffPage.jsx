import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';

const CreateStaffPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'staff' // Default role
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await authService.createStaff(formData);
            setSuccess('Tạo nhân viên thành công!');
            // Reset form
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'staff'
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo nhân viên');
        }
    };

    return (
        <div className="create-staff-page">
            <div className="page-header">
                <h1 className="page-title">Tạo Tài khoản Nhân viên</h1>
            </div>

            <div className="card form-card">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên hiển thị</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Nhập tên nhân viên"
                        />
                    </div>

                    <div className="form-group">
                        <label>Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <div className="form-group">
                        <label>Vai trò</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="staff">Nhân viên (Staff)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary">
                            Tạo tài khoản
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .form-card {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .form-input {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 6px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: var(--text-primary);
                }
                .form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(15, 76, 129, 0.1);
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                .btn-secondary {
                    background: white;
                    border: 1px solid #cbd5e1;
                    color: var(--text-primary);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-secondary:hover {
                    background: #f1f5f9;
                }
                .alert {
                    padding: 1rem;
                    border-radius: 6px;
                    margin-bottom: 1.5rem;
                    font-weight: 500;
                }
                .alert-error {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #991b1b;
                }
                .alert-success {
                    background: #dcfce7;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                }
            `}</style>
        </div>
    );
};

export default CreateStaffPage;
