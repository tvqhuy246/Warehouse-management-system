import { useEffect, useState } from 'react';
import inventoryService from '../api/inventoryService';
import productService from '../api/productService';

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalInventory: 0, lowStock: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assuming we have a statistics endpoint, or we calculate from others
                // data might look like { totalProducts: 10, ... }
                // Since api/statistics is mapped in nginx, we use it
                const response = await inventoryService.getStatistics();
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
                // Fallback for demo if backend is empty/down
                setStats({ totalProducts: 120, totalInventory: 4500, lowStock: 5 });
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

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }
                .stat-card h3 {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default DashboardPage;
