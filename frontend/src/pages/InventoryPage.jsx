import { useEffect, useState } from 'react';
import inventoryService from '../api/inventoryService';
import { exportToCSV } from '../utils/helpers';

const InventoryPage = () => {
    const [inbound, setInbound] = useState([]);
    const [outbound, setOutbound] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inbound');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [inRes, outRes] = await Promise.all([
                inventoryService.getInboundRequests(),
                inventoryService.getOutboundRequests()
            ]);
            setInbound(inRes.data.data || []); // Assuming API returns { data: [...] }
            setOutbound(outRes.data.data || []);
        } catch (error) {
            console.error("Failed to load inventory data", error);
            // Fallback mock if API fails/empty
            setInbound([
                { id: 1, product_name: 'IPhone 13', quantity: 50, status: 'completed', created_at: '2023-10-01' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const data = activeTab === 'inbound' ? inbound : outbound;
        exportToCSV(data, `${activeTab}_requests.csv`);
    };

    const currentData = activeTab === 'inbound' ? inbound : outbound;
    const filteredData = currentData.filter(item =>
        (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.id && item.id.toString().includes(searchTerm))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Inventory Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="form-input"
                        style={{ width: '250px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleExport}>Export {activeTab}</button>
                    <button className="btn-primary" style={{ background: 'var(--secondary-color)' }}>New Request</button>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'inbound' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inbound')}
                >
                    Inbound Requests
                </button>
                <button
                    className={`tab-btn ${activeTab === 'outbound' ? 'active' : ''}`}
                    onClick={() => setActiveTab('outbound')}
                >
                    Outbound Requests
                </button>
            </div>

            <div className="card">
                {loading ? <p>Loading...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map(item => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>{item.product_name || 'N/A'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{new Date(item.created_at || Date.now()).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${item.status?.toLowerCase() || 'pending'}`}>
                                            {item.status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .tabs {
                    margin-bottom: 2rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .tab-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    padding: 1rem 2rem;
                    font-size: 1rem;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                }
                .tab-btn.active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                }
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: capitalize;
                }
                .status-badge.pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
                .status-badge.approved { background: rgba(52, 211, 153, 0.2); color: #34d399; }
                .status-badge.completed { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; }
            `}</style>
        </div>
    );
};

export default InventoryPage;
