import { useEffect, useState } from 'react';
import inventoryService from '../api/inventoryService';
import productService from '../api/productService';

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalInventory: 0, lowStock: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await inventoryService.getReport();
                const reportData = response.data.data || response.data;

                if (Array.isArray(reportData)) {
                    const totalProducts = reportData.length;
                    const totalInventory = reportData.reduce((sum, item) => sum + (item.current_stock || 0), 0);
                    const lowStock = reportData.filter(item => item.status === 'LOW_STOCK').length;

                    setStats({
                        totalProducts,
                        totalInventory,
                        lowStock,
                        pendingOrders: 5 // Placeholder or fetch from inout service
                    });
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
                setStats({ totalProducts: 0, totalInventory: 0, lowStock: 0, pendingOrders: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, color }) => (
        <div className="card stat-card" style={{ borderColor: color }}>
            <h3>{title}</h3>
            <div className="stat-value" style={{ color: color }}>{value}</div>
        </div>
    );

    return (
        <div>
            <h1 className="page-title">Dashboard</h1>
            {loading ? (
                <p>Loading stats...</p>
            ) : (
                <div className="stats-grid">
                    <StatCard title="Total Products" value={stats.totalProducts || 0} color="#60a5fa" />
                    <StatCard title="Total Inventory" value={stats.totalInventory || 0} color="#34d399" />
                    <StatCard title="Low Stock Items" value={stats.lowStock || 0} color="#f87171" />
                    <StatCard title="Pending Orders" value={stats.pendingOrders || 12} color="#fbbf24" />
                </div>
            )}

            <div className="card chart-section" style={{ marginTop: '2rem' }}>
                <h2>Recent Activity</h2>
                <p style={{ color: 'var(--text-secondary)' }}>No recent activity to display.</p>
                {/* Placeholder for future charts */}
            </div>
        </div>
    );
};

export default DashboardPage;
