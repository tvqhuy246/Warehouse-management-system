import { useState, useEffect } from 'react';
import partnerService from '../api/partnerService';

const PartnerPage = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(''); // 1: Supplier, 2: Customer
    const [showModal, setShowModal] = useState(false);
    const [newPartner, setNewPartner] = useState({ name: '', type: 1, phone: '', address: '', email: '' });

    useEffect(() => {
        fetchPartners();
    }, [filter]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await partnerService.getPartners(filter);
            setPartners(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch partners", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await partnerService.createPartner(newPartner);
            setShowModal(false);
            setNewPartner({ name: '', type: 1, phone: '', address: '', email: '' });
            fetchPartners();
        } catch (error) {
            alert("Lỗi khi tạo đối tác: " + error.message);
        }
    };

    return (
        <div className="partner-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý Đối tác</h1>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Thêm Đối tác</button>
            </div>

            <div className="filter-tabs">
                <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>Tất cả</button>
                <button className={filter === '1' ? 'active' : ''} onClick={() => setFilter('1')}>Nhà cung cấp</button>
                <button className={filter === '2' ? 'active' : ''} onClick={() => setFilter('2')}>Khách hàng</button>
            </div>

            <div className="card">
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Loại</th>
                                <th>Số điện thoại</th>
                                <th>Địa chỉ</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partners.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>
                                        <span className={`badge ${p.type === 1 ? 'badge-info' : 'badge-success'}`}>
                                            {p.type === 1 ? 'Nhà cung cấp' : 'Khách hàng'}
                                        </span>
                                    </td>
                                    <td>{p.phone}</td>
                                    <td>{p.address}</td>
                                    <td>{p.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h2>Thêm Đối tác mới</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Tên đối tác</label>
                                <input type="text" required value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Loại</label>
                                <select value={newPartner.type} onChange={e => setNewPartner({ ...newPartner, type: parseInt(e.target.value) })}>
                                    <option value={1}>Nhà cung cấp</option>
                                    <option value={2}>Khách hàng</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="text" value={newPartner.phone} onChange={e => setNewPartner({ ...newPartner, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input type="text" value={newPartner.address} onChange={e => setNewPartner({ ...newPartner, address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={newPartner.email} onChange={e => setNewPartner({ ...newPartner, email: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .filter-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .filter-tabs button {
                    background: white;
                    border: 1px solid #cbd5e1;
                    color: var(--text-secondary);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .filter-tabs button:hover {
                    background: #f1f5f9;
                }
                .filter-tabs button.active {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }
                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .badge-info { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }
                .badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(2px);
                }
                .modal-content {
                    width: 100%;
                    max-width: 500px;
                    padding: 2rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                }
                .modal-content h2 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    color: var(--primary-color);
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 1rem;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 1.5rem;
                }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500; }
                .form-group input, .form-group select { 
                    width: 100%; 
                    padding: 0.5rem; 
                    border-radius: 4px; 
                    background: white; 
                    border: 1px solid #cbd5e1; 
                    color: var(--text-primary);
                }
                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(15, 76, 129, 0.1);
                }
            `}</style>
        </div>
    );
};

export default PartnerPage;
