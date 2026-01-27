import { useState, useEffect } from 'react';
import inventoryService from '../api/inventoryService';
import partnerService from '../api/partnerService';
import productService from '../api/productService';

const OutboundPage = () => {
    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [suggestions, setSuggestions] = useState({}); // {idx: suggestions[]}
    const [newOrder, setNewOrder] = useState({ partner_id: '', note: '', created_by: 'Admin' });

    // Filter State
    const [filterType, setFilterType] = useState('all'); // all, month, quarter, year
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterQuarter, setFilterQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));

    useEffect(() => {
        fetchOrders();
        fetchPartners();
        fetchProducts();
    }, [filterType, filterYear, filterMonth, filterQuarter]);

    const getDateRange = () => {
        if (filterType === 'all') return {};

        let from, to;
        if (filterType === 'year') {
            from = new Date(filterYear, 0, 1);
            to = new Date(filterYear, 11, 31);
        } else if (filterType === 'month') {
            from = new Date(filterYear, filterMonth - 1, 1);
            to = new Date(filterYear, filterMonth, 0);
        } else if (filterType === 'quarter') {
            const startMonth = (filterQuarter - 1) * 3;
            from = new Date(filterYear, startMonth, 1);
            to = new Date(filterYear, startMonth + 3, 0);
        }

        const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        return { from: formatDate(from), to: formatDate(to) };
    };

    const fetchOrders = async () => {
        try {
            const filters = getDateRange();
            const response = await inventoryService.getOutbounds(filters);
            setOrders(response.data.data || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchPartners = async () => {
        const response = await partnerService.getPartners(2); // Customers
        setPartners(response.data.data || []);
    };

    const fetchProducts = async () => {
        const response = await productService.getProducts();
        setProducts(response.data || []);
    };

    const addItem = () => {
        setSelectedItems([...selectedItems, { product_id: '', quantity: 1, price: 0 }]);
    };

    const getSelectedProduct = (productId) => {
        return products.find(p => p.id === productId); // ID is UUID now
    };

    const updateItem = async (index, field, value) => {
        const updated = [...selectedItems];
        updated[index][field] = value;

        // Auto-calculate price based on category margin
        if (field === 'product_id' || field === 'quantity') {
            const product = field === 'product_id'
                ? getSelectedProduct(value)
                : getSelectedProduct(updated[index].product_id);

            if (product && product.price) {
                const quantity = field === 'quantity' ? parseFloat(value) || 1 : parseFloat(updated[index].quantity) || 1;
                // Use category outbound_margin or default to +5%
                const margin = product.category?.outbound_margin || 5;
                const adjustedPrice = product.price * (1 + margin / 100);
                updated[index].price = Math.round(adjustedPrice);
            } else if (field === 'product_id') {
                updated[index].price = 0;
            }

            // Auto-populate location if product selected and has default location
            if (field === 'product_id' && product?.location) {
                updated[index].warehouse = product.location.warehouse;
                updated[index].zone = product.location.zone;
                updated[index].aisle = product.location.aisle;
                updated[index].shelf = product.location.shelf;
                updated[index].location_code = product.location.location_code;
            }

            // FIFO suggestions
            const item = updated[index];
            if (item.product_id && item.quantity > 0) {
                try {
                    const res = await inventoryService.suggestFIFO(item.product_id, item.quantity);
                    setSuggestions(prev => ({ ...prev, [index]: res.data.data.suggestions }));
                } catch (e) { console.error(e); }
            }
        }

        setSelectedItems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await inventoryService.createOutbound({ ...newOrder, details: selectedItems });
            alert('Tạo phiếu xuất thành công!');
            setShowModal(false);
            setSelectedItems([]);
            setSuggestions({});
            fetchOrders();
        } catch (error) {
            console.error('Create outbound error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert("Lỗi xuất kho: " + errorMsg);
        }
    };

    const handleViewDetail = async (id) => {
        try {
            const response = await inventoryService.getOutboundDetail(id);
            setSelectedOrder(response.data.data);
            setDetailModal(true);
        } catch (error) {
            console.error(error);
            alert('Không thể tải chi tiết phiếu xuất');
        }
    };

    return (
        <div className="outbound-page">
            <div className="page-header">
                <h1 className="page-title">Xuất kho (PX)</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-success" onClick={async () => {
                        try {
                            const filters = getDateRange();
                            const response = await inventoryService.exportOutbounds(filters);
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `PhieuXuat_${filterType}.xlsx`);
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        } catch (error) {
                            console.error(error);
                            alert('Lỗi khi xuất Excel');
                        }
                    }}>Xuất Excel</button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Tạo Phiếu Xuất</button>
                </div>
            </div>

            <div className="card mb-4" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                    <label style={{ marginRight: '0.5rem', fontWeight: 600 }}>Lọc theo:</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '0.25rem' }}>
                        <option value="all">Tất cả</option>
                        <option value="month">Tháng</option>
                        <option value="quarter">Quý</option>
                        <option value="year">Năm</option>
                    </select>
                </div>

                {filterType !== 'all' && (
                    <div>
                        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} style={{ padding: '0.25rem', marginRight: '0.5rem' }}>
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                    </div>
                )}

                {filterType === 'month' && (
                    <div>
                        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} style={{ padding: '0.25rem' }}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                    </div>
                )}

                {filterType === 'quarter' && (
                    <div>
                        <select value={filterQuarter} onChange={e => setFilterQuarter(Number(e.target.value))} style={{ padding: '0.25rem' }}>
                            {[1, 2, 3, 4].map(q => (
                                <option key={q} value={q}>Quý {q}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Mã phiếu</th>
                            <th>Khách hàng</th>
                            <th>Ngày xuất</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td><strong>{o.order_code}</strong></td>
                                <td>{o.partner?.name}</td>
                                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td>{Number(o.total_amount).toLocaleString()} đ</td>
                                <td><span className="badge badge-success">{o.status}</span></td>
                                <td>
                                    <button className="btn-sm btn-info" onClick={() => handleViewDetail(o.id)}>Chi tiết</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '900px' }}>
                        <h2>Tạo Phiếu Xuất Kho</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Khách hàng</label>
                                    <select required value={newOrder.partner_id} onChange={e => setNewOrder({ ...newOrder, partner_id: e.target.value })}>
                                        <option value="">Chọn Khách hàng</option>
                                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Ghi chú</label>
                                    <input type="text" value={newOrder.note} onChange={e => setNewOrder({ ...newOrder, note: e.target.value })} />
                                </div>
                            </div>

                            <h3>Chi tiết hàng hóa & Gợi ý FIFO</h3>
                            <div className="items-list">
                                {selectedItems.map((item, idx) => {
                                    const selectedProduct = getSelectedProduct(item.product_id);
                                    return (
                                        <div key={idx} className="item-container">
                                            <div className="item-row">
                                                <select
                                                    required
                                                    value={item.product_id}
                                                    onChange={e => updateItem(idx, 'product_id', e.target.value)}
                                                    style={{ flex: '2' }}
                                                >
                                                    <option value="">Chọn SP</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name || p.ten_san_pham} ({p.sku})
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    placeholder="SL"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                    style={{ width: '80px' }}
                                                    min="1"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Giá"
                                                    value={item.price}
                                                    onChange={e => updateItem(idx, 'price', e.target.value)}
                                                    style={{ width: '120px' }}
                                                    min="0"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Kho"
                                                    value={item.warehouse || ''}
                                                    onChange={e => {
                                                        const updated = [...selectedItems];
                                                        updated[idx].warehouse = e.target.value;
                                                        updated[idx].location_code = `${e.target.value || ''}-${updated[idx].zone || ''}-${updated[idx].aisle || ''}-${updated[idx].shelf || ''}`;
                                                        setSelectedItems(updated);
                                                    }}
                                                    style={{ width: '50px' }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Khu"
                                                    value={item.zone || ''}
                                                    onChange={e => {
                                                        const updated = [...selectedItems];
                                                        updated[idx].zone = e.target.value;
                                                        updated[idx].location_code = `${updated[idx].warehouse || ''}-${e.target.value || ''}-${updated[idx].aisle || ''}-${updated[idx].shelf || ''}`;
                                                        setSelectedItems(updated);
                                                    }}
                                                    style={{ width: '50px' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-remove"
                                                    onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {selectedProduct && (
                                                <div className="product-info">
                                                    <span className="info-badge">
                                                        {selectedProduct.name || selectedProduct.ten_san_pham}
                                                    </span>
                                                    <span className="info-badge">
                                                        ĐVT: {selectedProduct.unit || selectedProduct.don_vi_tinh || 'Cái'}
                                                    </span>
                                                    {selectedProduct.price && (
                                                        <span className="info-badge price-info">
                                                            Giá gốc: {Number(selectedProduct.price).toLocaleString()} đ
                                                            {item.quantity > 0 && (
                                                                <> → Đề xuất: <strong>{Math.round(selectedProduct.price * (1 + (products.find(p => p.id === item.product_id)?.category?.outbound_margin || 5) / 100)).toLocaleString()} đ</strong></>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {item.location_code && (
                                                <div className="location-preview">
                                                    Vị trí xuất: <code>{item.location_code}</code>
                                                    {suggestions[idx] && suggestions[idx].length > 0 && <small style={{ marginLeft: '10px' }}>(Thay vì FIFO)</small>}
                                                </div>
                                            )}
                                            {suggestions[idx] && (
                                                <div className="fifo-suggestions">
                                                    <small>🔍 Gợi ý FIFO: {suggestions[idx].map(s => `${s.batch_number} (${s.quantity}) tại ${s.location_code}`).join(', ')}</small>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <button type="button" className="btn-secondary" onClick={addItem}>+ Thêm dòng</button>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary">Xác nhận Xuất kho</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detailModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '800px' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2>Chi tiết Phiếu Xuất: {selectedOrder.order_code}</h2>
                            <span className={`badge badge-success`}>{selectedOrder.status}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><strong>Khách hàng:</strong> {selectedOrder.partner?.name}</div>
                            <div><strong>Ngày tạo:</strong> {new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString()}</div>
                            <div><strong>Người tạo:</strong> {selectedOrder.created_by}</div>
                            <div><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có'}</div>
                        </div>

                        <h3>Danh sách sản phẩm</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.details?.map((detail, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            {(() => {
                                                const p = products.find(p => p.id === detail.product_id) || detail.product;
                                                return (
                                                    <>
                                                        {p?.name || p?.ten_san_pham || detail.product_id}
                                                        <div className="text-sm text-gray-500">{p?.sku}</div>
                                                    </>
                                                );
                                            })()}
                                        </td>
                                        <td>{detail.quantity}</td>
                                        <td>{Number(detail.price).toLocaleString()} đ</td>
                                        <td>{Number(Number(detail.quantity) * Number(detail.price)).toLocaleString()} đ</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng:</td>
                                    <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        {Number(selectedOrder.total_amount).toLocaleString()} đ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setDetailModal(false)}>Đóng</button>
                            <button type="button" className="btn-primary" onClick={() => window.alert('Tính năng in đang phát triển')}>In Phiếu</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .form-row { display: flex; gap: 1rem; }
                .flex-1 { flex: 1; }
                .item-container { 
                    background: #f8fafc; 
                    padding: 0.75rem; 
                    border-radius: 4px; 
                    margin-bottom: 1rem; 
                    border: 1px solid #e2e8f0;
                    border-left: 3px solid var(--secondary-color); 
                }
                .item-row { display: flex; gap: 0.5rem; align-items: center; }
                .item-row input, .item-row select { 
                    padding: 0.5rem; 
                    border-radius: 4px; 
                    background: white; 
                    border: 1px solid #cbd5e1; 
                    color: var(--text-primary); 
                }
                .item-row input:focus, .item-row select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(15, 76, 129, 0.1);
                }
                .product-info {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    flex-wrap: wrap;
                }
                .info-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    color: #64748b;
                }
                .price-info {
                    background: #dcfce7;
                    border-color: #bbf7d0;
                    color: #166534;
                    font-weight: 500;
                }
                .btn-remove {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    width: 32px;
                    height: 32px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1.25rem;
                    line-height: 1;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-remove:hover {
                    background: #fca5a5;
                }
                .fifo-suggestions { 
                    margin-top: 0.5rem; 
                    color: #64748b; 
                    font-style: italic; 
                    font-size: 0.85rem;
                    background: #fffbeb;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #fde68a;
                    display: inline-block;
                }
                .badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
                .modal-content { padding: 2rem; overflow-y: auto; max-height: 90vh; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                .modal-content h2 { margin-top: 0; color: var(--primary-color); border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem; }
                .modal-content h3 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 1rem; color: #475569; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
                .location-preview {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    margin-top: 0.5rem;
                    background: #e0f2fe;
                    border: 1px solid #bae6fd;
                    border-radius: 4px;
                    color: #0369a1;
                    display: inline-block;
                }
                .location-preview code {
                    background: rgba(255,255,255,0.5);
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                    font-family: monospace;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default OutboundPage;
