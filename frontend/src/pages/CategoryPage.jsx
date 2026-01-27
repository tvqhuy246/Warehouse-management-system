import { useState, useEffect } from 'react';
import categoryService from '../api/categoryService';
import { isAdmin } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        inbound_margin: 0,
        outbound_margin: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin()) {
            alert('Chỉ admin mới có quyền truy cập trang này!');
            navigate('/dashboard');
            return;
        }
        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, formData);
                alert('Cập nhật danh mục thành công!');
            } else {
                await categoryService.create(formData);
                alert('Tạo danh mục thành công!');
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            inbound_margin: category.inbound_margin,
            outbound_margin: category.outbound_margin
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoryService.remove(id);
            alert('Xóa danh mục thành công!');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', inbound_margin: 0, outbound_margin: 0 });
        setEditingCategory(null);
    };

    if (loading) return <div className="page-container">Đang tải...</div>;

    return (
        <div className="category-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý Danh mục & Tỉ giá</h1>
                <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    + Thêm Danh mục
                </button>
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tên danh mục</th>
                            <th>Mô tả</th>
                            <th>Tỉ giá nhập (%)</th>
                            <th>Tỉ giá xuất (%)</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td><strong>{cat.name}</strong></td>
                                <td>{cat.description}</td>
                                <td>
                                    <span className={cat.inbound_margin < 0 ? 'margin-negative' : 'margin-positive'}>
                                        {cat.inbound_margin > 0 ? '+' : ''}{cat.inbound_margin}%
                                    </span>
                                </td>
                                <td>
                                    <span className={cat.outbound_margin < 0 ? 'margin-negative' : 'margin-positive'}>
                                        {cat.outbound_margin > 0 ? '+' : ''}{cat.outbound_margin}%
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(cat)}>Sửa</button>
                                    <button className="btn-delete" onClick={() => handleDelete(cat.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '600px' }}>
                        <h2>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên danh mục *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ví dụ: Điện tử, Văn phòng phẩm"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả về danh mục này"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Tỉ giá nhập (%) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={formData.inbound_margin}
                                        onChange={e => setFormData({ ...formData, inbound_margin: parseFloat(e.target.value) })}
                                        placeholder="-5 (giảm 5%)"
                                    />
                                    <small>Âm = giảm giá, Dương = tăng giá</small>
                                </div>

                                <div className="form-group flex-1">
                                    <label>Tỉ giá xuất (%) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={formData.outbound_margin}
                                        onChange={e => setFormData({ ...formData, outbound_margin: parseFloat(e.target.value) })}
                                        placeholder="5 (tăng 5%)"
                                    />
                                    <small>Âm = giảm giá, Dương = tăng giá</small>
                                </div>
                            </div>

                            <div className="pricing-example">
                                <h4>Ví dụ tính giá:</h4>
                                <p>Giá gốc: 1,000,000đ</p>
                                <p>→ Giá nhập: {(1000000 * (1 + formData.inbound_margin / 100)).toLocaleString()}đ</p>
                                <p>→ Giá xuất: {(1000000 * (1 + formData.outbound_margin / 100)).toLocaleString()}đ</p>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .form-row { display: flex; gap: 1rem; }
                .flex-1 { flex: 1; }
                .margin-negative { color: #f87171; font-weight: bold; }
                .margin-positive { color: #34d399; font-weight: bold; }
                .btn-edit { 
                    background: rgba(59, 130, 246, 0.2); 
                    border: 1px solid rgba(59, 130, 246, 0.5); 
                    color: #60a5fa; 
                    padding: 0.25rem 0.75rem; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    margin-right: 0.5rem;
                }
                .btn-edit:hover { background: rgba(59, 130, 246, 0.3); }
                .btn-delete { 
                    background: rgba(239, 68, 68, 0.2); 
                    border: 1px solid rgba(239, 68, 68, 0.5); 
                    color: #f87171; 
                    padding: 0.25rem 0.75rem; 
                    border-radius: 4px; 
                    cursor: pointer; 
                }
                .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
                .pricing-example {
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 4px;
                    padding: 1rem;
                    margin: 1rem 0;
                }
                .pricing-example h4 { margin-top: 0; color: #60a5fa; }
                .pricing-example p { margin: 0.5rem 0; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { padding: 2rem; overflow-y: auto; max-height: 90vh; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
            `}</style>
        </div>
    );
};

export default CategoryPage;
