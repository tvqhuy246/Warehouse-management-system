import { useEffect, useState } from 'react';
import productService from '../api/productService';
import categoryService from '../api/categoryService';
import locationService from '../api/locationService';
import { exportToCSV, isAdmin } from '../utils/helpers';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        unit: '',
        price: '',
        min_stock: '',
        category_id: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProducts();
        loadCategories();
        loadLocations();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await productService.getAllProducts();
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products", err);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await categoryService.getAll();
            setCategories(res.data || []);
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };

    const loadLocations = async () => {
        try {
            const res = await locationService.getAll();
            setLocations(res.data || []);
        } catch (err) {
            console.error("Failed to load locations", err);
        }
    };

    const handleExport = () => {
        exportToCSV(products, 'products_list.csv');
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowModal(true);
        setFormData({
            sku: '',
            name: '',
            unit: '',
            price: '',
            min_stock: '',
            category_id: '',
            default_location_id: ''
        });
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowModal(true);
        setFormData({
            sku: product.sku || '',
            name: product.name || product.ten_san_pham || '',
            unit: product.unit || product.don_vi_tinh || '',
            price: product.price || '',
            min_stock: product.min_stock || '',
            category_id: product.category_id || '',
            default_location_id: product.default_location_id || ''
        });
    };

    const handleDeleteProduct = (product) => {
        setDeletingProduct(product);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deletingProduct) return;

        try {
            await productService.deleteProduct(deletingProduct.id);
            alert('Xóa sản phẩm thành công!');
            setShowDeleteConfirm(false);
            setDeletingProduct(null);
            loadProducts();
        } catch (err) {
            console.error("Failed to delete product", err);
            alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xóa sản phẩm'));
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            sku: '',
            name: '',
            unit: '',
            price: '',
            min_stock: '',
            category_id: '',
            default_location_id: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const productData = {
                sku: formData.sku,
                name: formData.name,
                unit: formData.unit,
                price: parseFloat(formData.price),
                min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0,
                category_id: formData.category_id || null,
                default_location_id: formData.default_location_id || null
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, productData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await productService.createProduct(productData);
                alert('Thêm sản phẩm thành công!');
            }

            handleCloseModal();
            loadProducts();
        } catch (err) {
            console.error("Failed to save product", err);
            alert('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu sản phẩm'));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        (p.name || p.ten_san_pham || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-input"
                        style={{ width: '250px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleExport}>Export CSV</button>
                    {isAdmin() && <button className="btn-primary" onClick={handleAddProduct}>Add Product</button>}
                </div>
            </div>

            <div className="card">
                {loading ? <p>Loading...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Đơn vị</th>
                                <th>Vị trí mặc định</th>
                                <th>Giá</th>
                                <th>Định mức</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td><code className="sku-code">{p.sku}</code></td>
                                    <td>{p.name || p.ten_san_pham}</td>
                                    <td>{p.category?.name || 'N/A'}</td>
                                    <td>{p.unit || p.don_vi_tinh}</td>
                                    <td>
                                        {p.location ? (
                                            <span className="location-tag">{p.location.location_code}</span>
                                        ) : 'Chưa gán'}
                                    </td>
                                    <td>{Number(p.price).toLocaleString()} đ</td>
                                    <td>{p.min_stock}</td>
                                    <td>
                                        {isAdmin() && (
                                            <>
                                                <button className="btn-text" onClick={() => handleEditProduct(p)}>Sửa</button>
                                                <button className="btn-text danger" onClick={() => handleDeleteProduct(p)}>Xóa</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>SKU</label>
                                <input
                                    type="text"
                                    name="sku"
                                    className="form-input"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mã SKU"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Danh mục</label>
                                <select
                                    name="category_id"
                                    className="form-input"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Không có</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Vị trí mặc định</label>
                                <select
                                    name="default_location_id"
                                    className="form-input"
                                    value={formData.default_location_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Chưa gán</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.location_code} ({loc.warehouse}-{loc.zone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Đơn vị tính</label>
                                <input
                                    type="text"
                                    name="unit"
                                    className="form-input"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    placeholder="VD: Cái, Hộp, Kg..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Giá *</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="Nhập giá sản phẩm"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Định mức tồn kho tối thiểu</label>
                                <input
                                    type="number"
                                    name="min_stock"
                                    className="form-input"
                                    value={formData.min_stock}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số lượng tối thiểu"
                                    min="0"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? (editingProduct ? 'Đang cập nhật...' : 'Đang thêm...') : (editingProduct ? 'Cập nhật' : 'Thêm sản phẩm')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <h2>Xác nhận xóa</h2>
                        <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deletingProduct?.name || deletingProduct?.ten_san_pham}</strong>?</p>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                Hủy
                            </button>
                            <button type="button" className="btn-danger" onClick={confirmDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th, .data-table td {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                }
                .data-table th {
                    color: var(--text-primary);
                    font-weight: 600;
                    background: #f8fafc;
                    border-bottom: 2px solid #e2e8f0;
                }
                .btn-text {
                    background: transparent;
                    border: none;
                    color: var(--primary-color);
                    padding: 0.25rem 0.5rem;
                    margin-right: 0.5rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                    text-decoration: none;
                    font-weight: 500;
                }
                .btn-text.danger {
                    color: #ef4444;
                }
                .btn-text:hover {
                    text-decoration: underline;
                }
                .btn-danger {
                    background: #ef4444;
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                }
                .btn-danger:hover {
                    background: #dc2626;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(2px);
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .modal-content h2 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    color: var(--primary-color);
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 1rem;
                }
                .modal-content p {
                    color: var(--text-secondary);
                    line-height: 1.6;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.375rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .form-input, select.form-input {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    background: white;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    color: var(--text-primary);
                    font-size: 0.875rem;
                }
                .form-input:focus, select.form-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(15, 76, 129, 0.1);
                }
                select.form-input option {
                    background: white;
                    color: var(--text-primary);
                }
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 1.5rem;
                }
                .btn-secondary {
                    background: white;
                    border: 1px solid #cbd5e1;
                    color: var(--text-primary);
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .btn-secondary:hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }
                .location-tag { 
                    background: #f1f5f9; 
                    border: 1px solid #cbd5e1; 
                    padding: 0.2rem 0.5rem; 
                    border-radius: 4px; 
                    color: #475569; 
                    font-size: 0.85rem; 
                    font-family: monospace;
                    font-weight: 600;
                }
                .sku-code {
                    background: #f1f5f9;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: monospace;
                    border: 1px solid #e2e8f0;
                    color: #0f4c81;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default ProductPage;
