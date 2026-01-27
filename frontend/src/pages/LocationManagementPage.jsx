import { useState, useEffect } from 'react';
import locationService from '../api/locationService';

const LocationManagementPage = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [formData, setFormData] = useState({
        warehouse: '',
        zone: '',
        aisle: '',
        shelf: '',
        capacity: 0,
        status: 'ACTIVE'
    });
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchLocations();
    }, [filters]);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const response = await locationService.getAll(filters);
            setLocations(response.data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
            alert('Lỗi khi tải danh sách vị trí');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLocation = () => {
        setEditingLocation(null);
        setFormData({ warehouse: '', zone: '', aisle: '', shelf: '', capacity: 0, status: 'ACTIVE' });
        setShowModal(true);
    };

    const handleEditLocation = (location) => {
        setEditingLocation(location);
        setFormData({
            warehouse: location.warehouse,
            zone: location.zone,
            aisle: location.aisle,
            shelf: location.shelf,
            capacity: location.capacity,
            status: location.status
        });
        setShowModal(true);
    };

    const handleDeleteLocation = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa vị trí này?')) return;

        try {
            await locationService.remove(id);
            alert('Xóa vị trí thành công!');
            fetchLocations();
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Lỗi: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingLocation) {
                await locationService.update(editingLocation.id, formData);
                alert('Cập nhật vị trí thành công!');
            } else {
                await locationService.create(formData);
                alert('Tạo vị trí thành công!');
            }
            setShowModal(false);
            fetchLocations();
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Lỗi: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value || undefined
        }));
    };

    // Get unique values for filters
    const uniqueWarehouses = [...new Set(locations.map(l => l.warehouse))];
    const uniqueZones = [...new Set(locations.map(l => l.zone))];
    const uniqueAisles = [...new Set(locations.map(l => l.aisle))];
    const uniqueShelves = [...new Set(locations.map(l => l.shelf))];

    return (
        <div className="location-management-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý Vị trí Kho</h1>
                <button className="btn-primary" onClick={handleAddLocation}>+ Thêm Vị trí</button>
            </div>

            {/* Filters */}
            <div className="card filters-section">
                <h3>Lọc theo vị trí</h3>
                <div className="filter-row">
                    <select value={filters.warehouse || ''} onChange={e => handleFilterChange('warehouse', e.target.value)}>
                        <option value="">Tất cả Kho</option>
                        {uniqueWarehouses.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <select value={filters.zone || ''} onChange={e => handleFilterChange('zone', e.target.value)}>
                        <option value="">Tất cả Khu</option>
                        {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <select value={filters.aisle || ''} onChange={e => handleFilterChange('aisle', e.target.value)}>
                        <option value="">Tất cả Hàng</option>
                        {uniqueAisles.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select value={filters.shelf || ''} onChange={e => handleFilterChange('shelf', e.target.value)}>
                        <option value="">Tất cả Kệ</option>
                        {uniqueShelves.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn-secondary" onClick={() => setFilters({})}>Xóa bộ lọc</button>
                </div>
            </div>

            {/* Locations Table */}
            <div className="card">
                {loading ? <p>Đang tải...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mã vị trí</th>
                                <th>Kho</th>
                                <th>Khu</th>
                                <th>Hàng</th>
                                <th>Kệ</th>
                                <th>Sức chứa</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map(loc => (
                                <tr key={loc.id}>
                                    <td><code className="location-code">{loc.location_code}</code></td>
                                    <td><span className="location-tag">{loc.warehouse}</span></td>
                                    <td><span className="location-tag">{loc.zone}</span></td>
                                    <td><span className="location-tag">{loc.aisle}</span></td>
                                    <td><span className="location-tag">{loc.shelf}</span></td>
                                    <td>{loc.capacity}</td>
                                    <td>
                                        <span className={`badge ${loc.status === 'ACTIVE' ? 'badge-success' : 'badge-inactive'}`}>
                                            {loc.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-text" onClick={() => handleEditLocation(loc)}>Sửa</button>
                                        <button className="btn-text btn-danger" onClick={() => handleDeleteLocation(loc.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                            {locations.length === 0 && (
                                <tr><td colSpan="8" style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '500px' }}>
                        <h2>{editingLocation ? 'Sửa Vị trí' : 'Thêm Vị trí Mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kho *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.warehouse}
                                        onChange={e => setFormData({ ...formData, warehouse: e.target.value })}
                                        placeholder="VD: A, B, C"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Khu *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.zone}
                                        onChange={e => setFormData({ ...formData, zone: e.target.value })}
                                        placeholder="VD: 01, 02"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hàng *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.aisle}
                                        onChange={e => setFormData({ ...formData, aisle: e.target.value })}
                                        placeholder="VD: 01, 05"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kệ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.shelf}
                                        onChange={e => setFormData({ ...formData, shelf: e.target.value })}
                                        placeholder="VD: 01, 03"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Sức chứa</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                            <div className="location-preview">
                                Mã vị trí: <code>{formData.warehouse}-{formData.zone}-{formData.aisle}-{formData.shelf}</code>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">
                                    {editingLocation ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .filters-section { margin-bottom: 1rem; }
                .filter-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
                .filter-row select { 
                    padding: 0.4rem 2rem 0.4rem 0.75rem; 
                    border-radius: 4px; 
                    background: white; 
                    border: 1px solid #cbd5e1; 
                    color: var(--text-primary);
                    font-size: 0.875rem;
                }
                .location-code { background: #e0f2fe; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; color: #0369a1; font-weight: 600; border: 1px solid #bae6fd; }
                .location-tag { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; color: #475569; font-size: 0.875rem; font-weight: 500; }
                .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
                .badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
                .badge-inactive { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
                .btn-text { background: none; border: none; color: var(--primary-color); cursor: pointer; text-decoration: none; font-size: 0.875rem; padding: 0.25rem 0.5rem; font-weight: 500; }
                .btn-text.btn-danger { color: #ef4444; }
                .btn-text:hover { text-decoration: underline; }
                .form-row { display: flex; gap: 1rem; }
                .form-group { flex: 1; margin-bottom: 1rem; }
                .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 500; color: var(--text-primary); }
                .form-group input, .form-group select { 
                    width: 100%; 
                    padding: 0.5rem; 
                    border-radius: 4px; 
                    background: white; 
                    border: 1px solid #cbd5e1; 
                    color: var(--text-primary);
                    font-size: 0.875rem;
                }
                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(15, 76, 129, 0.1);
                }
                .location-preview { margin: 1rem 0; padding: 0.75rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; color: #1e40af; }
                .location-preview code { background: white; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; font-weight: 700; border: 1px solid #dbeafe; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal-content { padding: 2rem; max-height: 90vh; overflow-y: auto; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: var(--primary-color); border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
            `}</style>
        </div>
    );
};

export default LocationManagementPage;
