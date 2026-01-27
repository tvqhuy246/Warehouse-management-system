import { useEffect, useState } from 'react';
import inventoryService from '../api/inventoryService';
import locationService from '../api/locationService';

const InventoryPage = () => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [locationDetail, setLocationDetail] = useState([]);

    // Location Filters
    const [locations, setLocations] = useState([]);
    const [locationFilters, setLocationFilters] = useState({
        warehouse: '',
        zone: '',
        aisle: '',
        shelf: ''
    });

    useEffect(() => {
        loadLocations();
    }, []);

    useEffect(() => {
        loadReport();
    }, [locationFilters]);

    const loadLocations = async () => {
        try {
            const res = await locationService.getAll();
            setLocations(res.data || []);
        } catch (error) {
            console.error("Failed to load locations", error);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            // Construct location_code prefix
            let locationPrefix = '';
            if (locationFilters.warehouse) {
                locationPrefix += locationFilters.warehouse;
                if (locationFilters.zone) {
                    locationPrefix += '-' + locationFilters.zone;
                    if (locationFilters.aisle) {
                        locationPrefix += '-' + locationFilters.aisle;
                        if (locationFilters.shelf) {
                            locationPrefix += '-' + locationFilters.shelf;
                        }
                    }
                }
            }

            const res = await inventoryService.getReport({ location_code: locationPrefix });
            setReport(res.data.data || []);
        } catch (error) {
            console.error("Failed to load report", error);
        } finally {
            setLoading(false);
        }
    };

    const viewLocationDetail = async (productId) => {
        const prod = report.find(p => p.product_id === productId);
        setSelectedProduct(prod);
        try {
            const res = await inventoryService.getInventoryByLocation(productId);
            setLocationDetail(res.data.data || []);
        } catch (e) { console.error(e); }
    };

    const filteredReport = Array.isArray(report) ? report.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    return (
        <div className="inventory-report">
            <div className="page-header">
                <h1 className="page-title">Báo cáo Nhập - Xuất - Tồn</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Tìm theo SKU hoặc tên..."
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-success" onClick={async () => {
                        try {
                            const response = await inventoryService.exportInventoryReport();
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'BaoCaoTonKho.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        } catch (error) {
                            console.error(error);
                            alert('Lỗi khi xuất Excel');
                        }
                    }}>Xuất Excel</button>
                    <button className="btn-secondary" onClick={loadReport}>Làm mới</button>
                </div>
            </div>

            {/* Location Filters Section */}
            <div className="card filters-section">
                <h3>Lọc theo vị trí</h3>
                <div className="filter-row">
                    <select
                        value={locationFilters.warehouse}
                        onChange={e => setLocationFilters({ ...locationFilters, warehouse: e.target.value, zone: '', aisle: '', shelf: '' })}
                    >
                        <option value="">Tất cả Kho</option>
                        {[...new Set(locations.map(l => l.warehouse))].map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <select
                        value={locationFilters.zone}
                        onChange={e => setLocationFilters({ ...locationFilters, zone: e.target.value, aisle: '', shelf: '' })}
                        disabled={!locationFilters.warehouse}
                    >
                        <option value="">Tất cả Khu</option>
                        {[...new Set(locations.filter(l => l.warehouse === locationFilters.warehouse).map(l => l.zone))].map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <select
                        value={locationFilters.aisle}
                        onChange={e => setLocationFilters({ ...locationFilters, aisle: e.target.value, shelf: '' })}
                        disabled={!locationFilters.zone}
                    >
                        <option value="">Tất cả Hàng</option>
                        {[...new Set(locations.filter(l => l.warehouse === locationFilters.warehouse && l.zone === locationFilters.zone).map(l => l.aisle))].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select
                        value={locationFilters.shelf}
                        onChange={e => setLocationFilters({ ...locationFilters, shelf: e.target.value })}
                        disabled={!locationFilters.aisle}
                    >
                        <option value="">Tất cả Kệ</option>
                        {[...new Set(locations.filter(l => l.warehouse === locationFilters.warehouse && l.zone === locationFilters.zone && l.aisle === locationFilters.aisle).map(l => l.shelf))].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {locationFilters.warehouse && (
                        <button className="btn-text" onClick={() => setLocationFilters({ warehouse: '', zone: '', aisle: '', shelf: '' })}>Xóa bộ lọc</button>
                    )}
                </div>
            </div>

            <div className="card">
                {loading ? <p>Đang tải dữ liệu...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Tên sản phẩm</th>
                                <th>ĐVT</th>
                                <th>Tổng Nhập</th>
                                <th>Tổng Xuất</th>
                                <th>Tồn cuối</th>
                                <th>Định mức</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReport.map(item => (
                                <tr key={item.product_id} className={item.status === 'LOW_STOCK' ? 'row-warning' : ''}>
                                    <td><code className="sku-code">{item.sku}</code></td>
                                    <td>{item.name}</td>
                                    <td>{item.uom}</td>
                                    <td>{item.total_in}</td>
                                    <td>{item.total_out}</td>
                                    <td className="font-bold">{item.current_stock}</td>
                                    <td>{item.min_stock}</td>
                                    <td>
                                        <span className={`badge ${item.status === 'LOW_STOCK' ? 'badge-danger' : 'badge-success'}`}>
                                            {item.status === 'LOW_STOCK' ? 'Sắp hết hàng' : 'Bình thường'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-text" onClick={() => viewLocationDetail(item.product_id)}>Chi tiết vị trí</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedProduct && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Vị trí tồn kho: {selectedProduct.name}</h2>
                            <button className="close-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
                        </div>
                        <p>SKU: <code>{selectedProduct.sku}</code> | Tổng tồn: <strong>{selectedProduct.current_stock}</strong></p>

                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Kho</th>
                                    <th>Khu</th>
                                    <th>Hàng</th>
                                    <th>Kệ</th>
                                    <th>Số lô (Batch)</th>
                                    <th>Số lượng</th>
                                    <th>Ngày nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locationDetail.map((loc, idx) => {
                                    // Parse location_code format: KHO-KHU-HANG-KE (e.g., "A-01-05-03")
                                    const parts = (loc.location_code || '').split('-');
                                    const warehouse = parts[0] || 'N/A';
                                    const zone = parts[1] || 'N/A';
                                    const aisle = parts[2] || 'N/A';
                                    const shelf = parts[3] || 'N/A';

                                    return (
                                        <tr key={idx}>
                                            <td><span className="location-tag">{warehouse}</span></td>
                                            <td><span className="location-tag">{zone}</span></td>
                                            <td><span className="location-tag">{aisle}</span></td>
                                            <td><span className="location-tag">{shelf}</span></td>
                                            <td>{loc.batch_number}</td>
                                            <td>{loc.quantity}</td>
                                            <td>{new Date(loc.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                                {locationDetail.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có dữ liệu vị trí</td></tr>}
                            </tbody>
                        </table>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedProduct(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .sku-code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; color: #0f4c81; font-weight: 600; border: 1px solid #e2e8f0; }
                .font-bold { font-weight: 700; color: var(--primary-color); }
                .row-warning { background-color: #fef2f2 !important; }
                .row-warning:hover { background-color: #fee2e2 !important; }
                
                .location-tag { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 0.2rem 0.5rem; border-radius: 4px; color: #334155; font-weight: 600; font-size: 0.8rem; }
                
                .header-actions { display: flex; gap: 1rem; align-items: center; }
                
                /* Filter Section styling override */
                .filters-section h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1rem; color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
                .filter-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
                .filter-row select { 
                    padding: 0.5rem 2rem 0.5rem 0.75rem; 
                    border-radius: 4px; 
                    background-color: white; 
                    border: 1px solid var(--border-color); 
                    color: var(--text-primary); 
                    min-width: 150px;
                    font-size: 0.875rem;
                }
                .filter-row select:focus { border-color: var(--primary-color); outline: none; }
                .filter-row select:disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
                
                .btn-text { background: none; border: none; color: var(--primary-color); cursor: pointer; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
                .btn-text:hover { text-decoration: underline; color: #0c3b66; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal-content { background: white; padding: 2rem; width: 90%; max-width: 800px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
                .modal-header h2 { margin: 0; color: var(--primary-color); font-size: 1.25rem; }
                .close-btn { background: none; border: none; font-size: 2rem; color: #64748b; cursor: pointer; line-height: 1; }
                .close-btn:hover { color: #0f172a; }
                .modal-actions { margin-top: 2rem; text-align: right; }
            `}</style>
        </div>
    );
};

export default InventoryPage;
