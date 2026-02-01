import { useEffect, useState } from 'react';
import inventoryService from '../api/inventoryService';
import productService from '../api/productService';
import authService from '../api/authService';

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalInventory: 0, lowStock: 0 });
    const [recentData, setRecentData] = useState({
        inbounds: [],
        outbounds: [],
        products: [],
        users: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Stats from Inventory Report
                const reportRes = await inventoryService.getReport();
                const reportData = reportRes.data.data || reportRes.data;
                let totalProducts = 0, totalInventory = 0, lowStock = 0;

                if (Array.isArray(reportData)) {
                    totalProducts = reportData.length;
                    totalInventory = reportData.reduce((sum, item) => sum + (item.current_stock || 0), 0);
                    lowStock = reportData.filter(item => item.status === 'LOW_STOCK').length;
                }

                setStats({ totalProducts, totalInventory, lowStock, pendingOrders: 5 });

                // 2. Recent Data (4 columns) & Capacity
                const [inRes, outRes, prodRes, userRes, capRes] = await Promise.all([
                    inventoryService.getInbounds({}),
                    inventoryService.getOutbounds({}),
                    productService.getProducts(),
                    authService.getAllUsers(),
                    inventoryService.getLocationCapacity()
                ]);

                // Helper to sort by date desc and take top 5
                const sortAndSlice = (data, dateField = 'createdAt') => {
                    if (!Array.isArray(data)) return [];
                    return [...data].sort((a, b) => {
                        const dateA = new Date(a[dateField] || a.created_at || 0);
                        const dateB = new Date(b[dateField] || b.created_at || 0);
                        return dateB - dateA;
                    }).slice(0, 5);
                };

                setRecentData({
                    inbounds: sortAndSlice(inRes.data.data || [], 'createdAt'),
                    outbounds: sortAndSlice(outRes.data.data || [], 'createdAt'),
                    products: sortAndSlice(prodRes.data || prodRes.data.data || [], 'created_at'),
                    users: sortAndSlice(userRes.data || [], 'created_at'),
                    capacities: capRes.data.data || []
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, color }) => (
        <div className="card stat-card" style={{ borderColor: color }}>
            <h3>{title}</h3>
            <div className="stat-value" style={{ color: color }}>{value}</div>
        </div>
    );

    const ActivityColumn = ({ title, items, renderItem, icon }) => (
        <div className="activity-column card">
            <div className="column-header">
                <span className="icon">{icon}</span>
                <h3>{title}</h3>
            </div>
            <div className="column-content">
                {items.length === 0 ? <p className="empty-text">Chưa có dữ liệu</p> : (
                    <ul className="activity-list">
                        {items.map((item, idx) => (
                            <li key={idx} className="activity-item">
                                {renderItem(item)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="page-title">Dashboard</h1>
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <>
                    <div className="stats-grid">
                        <StatCard title="Tổng Sản Phẩm" value={stats.totalProducts || 0} color="#60a5fa" />
                        <StatCard title="Tổng Tồn Kho" value={stats.totalInventory || 0} color="#34d399" />
                        <StatCard title="Sắp Hết Hàng" value={stats.lowStock || 0} color="#f87171" />
                        <StatCard title="Đơn Chờ Xử Lý" value={stats.pendingOrders || 0} color="#fbbf24" />
                    </div>

                    <div className="recent-activity-section">
                        <h2 className="section-title">Hoạt động gần đây</h2>
                        <div className="activity-grid">

                            {/* 1. Inbound */}
                            <ActivityColumn
                                title="Phiếu Nhập Mới"
                                icon="⬇️"
                                items={recentData.inbounds}
                                renderItem={item => (
                                    <>
                                        <div className="item-main">{item.order_code}</div>
                                        <div className="item-sub">
                                            <span>Bởi: <strong>{item.created_by}</strong></span>
                                            <span className="date">{new Date(item.createdAt || item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </>
                                )}
                            />

                            {/* 2. Outbound */}
                            <ActivityColumn
                                title="Phiếu Xuất Mới"
                                icon="⬆️"
                                items={recentData.outbounds}
                                renderItem={item => (
                                    <>
                                        <div className="item-main">{item.order_code}</div>
                                        <div className="item-sub">
                                            <span>Bởi: <strong>{item.created_by}</strong></span>
                                            <span className="date">{new Date(item.createdAt || item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </>
                                )}
                            />

                            {/* 3. Products */}
                            <ActivityColumn
                                title="Sản Phẩm Mới"
                                icon="📦"
                                items={recentData.products}
                                renderItem={item => (
                                    <>
                                        <div className="item-main">{item.name || item.ten_san_pham}</div>
                                        <div className="item-sub">
                                            <span>SKU: {item.sku}</span>
                                        </div>
                                    </>
                                )}
                            />

                            {/* 4. Staff */}
                            <ActivityColumn
                                title="Nhân Sự Mới"
                                icon="👤"
                                items={recentData.users}
                                renderItem={item => (
                                    <>
                                        <div className="item-main">{item.full_name || item.username}</div>
                                        <div className="item-sub">
                                            <span className="badge-role">{item.role}</span>
                                            <span className="date">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </>
                                )}
                            />

                        </div>
                    </div>

                    <div className="capacity-section" style={{ marginTop: '2rem' }}>
                        <h2 className="section-title">Sức Chứa Kho</h2>
                        <div className="card" style={{ overflowX: 'auto' }}>
                            <table className="capacity-table">
                                <thead>
                                    <tr>
                                        <th>Mã Vị Trí</th>
                                        <th>Sức Chứa (Max)</th>
                                        <th>Đang Chứa</th>
                                        <th>Còn Trống</th>
                                        <th>Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentData.capacities && recentData.capacities.length > 0 ? (
                                        recentData.capacities.map(loc => (
                                            <tr key={loc.id}>
                                                <td style={{ fontWeight: 600 }}>{loc.location_code}</td>
                                                <td>{loc.capacity}</td>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: loc.usage_percent > 90 ? 'red' : 'inherit' }}>
                                                        {loc.used}
                                                    </span>
                                                </td>
                                                <td>{loc.available}</td>
                                                <td>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${Math.min(loc.usage_percent, 100)}%`,
                                                                backgroundColor: loc.usage_percent > 90 ? '#ef4444' : (loc.usage_percent > 70 ? '#f59e0b' : '#22c55e')
                                                            }}
                                                        ></div>
                                                        <span className="progress-text">{loc.usage_percent}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>Chưa có dữ liệu vị trí</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .recent-activity-section { margin-top: 2rem; }
                .section-title { font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-primary); }
                .activity-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
                .activity-column { background: white; padding: 0; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
                .column-header { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 2px solid #f1f5f9; background: #f8fafc; }
                .column-header h3 { font-size: 0.95rem; margin: 0; color: #334155; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .column-content { padding: 0.5rem; flex: 1; overflow-y: auto; max-height: 400px; }
                .activity-list { list-style: none; padding: 0; margin: 0; }
                .activity-item { padding: 0.75rem 0.5rem; border-bottom: 1px dotted #e2e8f0; transition: background 0.2s; }
                .activity-item:last-child { border-bottom: none; }
                .activity-item:hover { background: #f8fafc; }
                .item-main { font-weight: 600; font-size: 0.9rem; color: #0f172a; margin-bottom: 0.25rem; }
                .item-sub { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b; }
                .date { font-size: 0.7rem; color: #94a3b8; }
                .badge-role { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 99px; font-weight: 600; font-size: 0.65rem; text-transform: uppercase; }
                .empty-text { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.875rem; font-style: italic; }
                
                .capacity-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                .capacity-table th { text-align: left; padding: 10px 15px; background: #f8fafc; color: #64748b; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
                .capacity-table td { padding: 10px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                .capacity-table tr:hover td { background: #f8fafc; }
                .progress-bar-container { width: 100%; background: #e2e8f0; height: 16px; border-radius: 8px; overflow: hidden; position: relative; }
                .progress-bar { height: 100%; transition: width 0.3s ease; }
                .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; color: #1e293b; font-weight: bold; text-shadow: 0 0 2px rgba(255,255,255,0.8); }

                @media (max-width: 1200px) { .activity-grid { grid-template-columns: 1fr 1fr; } }
                @media (max-width: 768px) { .activity-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default DashboardPage;
