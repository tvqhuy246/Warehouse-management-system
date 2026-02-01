import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import inventoryService from '../api/inventoryService';

const HRPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userHistory, setUserHistory] = useState({ inbounds: [], outbounds: [] });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // info, history

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await authService.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error(error);
            alert('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setActiveTab('info');
        setHistoryLoading(true);
        try {
            // Fetch history for this user
            const [inboundRes, outboundRes] = await Promise.all([
                inventoryService.getInbounds({ created_by: user.username }),
                inventoryService.getOutbounds({ created_by: user.username })
            ]);

            setUserHistory({
                inbounds: inboundRes.data.data || [],
                outbounds: outboundRes.data.data || []
            });
        } catch (error) {
            console.error('Fetch history error', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="hr-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý Nhân sự</h1>
                <button className="btn-primary" onClick={() => navigate('/create-staff')}>
                    + Tạo Nhân viên mới
                </button>
            </div>

            <div className="hr-content">
                {/* LIST COLUMN */}
                <div className="user-list card">
                    <h3 style={{ padding: '1rem', borderBottom: '1px solid #eee', margin: 0 }}>Danh sách nhân viên</h3>
                    <div className="list-container">
                        {loading ? <p style={{ padding: '1rem' }}>Đang tải...</p> : (
                            users.map(u => (
                                <div
                                    key={u.id}
                                    className={`user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                                    onClick={() => handleSelectUser(u)}
                                >
                                    <div className="avatar">{u.full_name?.charAt(0).toUpperCase()}</div>
                                    <div className="user-info-brief">
                                        <div className="user-name">{u.full_name || u.username}</div>
                                        <div className="user-role-badge">{u.role}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* DETAILS COLUMN */}
                <div className="user-details card">
                    {selectedUser ? (
                        <>
                            <div className="detail-header">
                                <div className="detail-avatar">{selectedUser.full_name?.charAt(0).toUpperCase()}</div>
                                <div>
                                    <h2 style={{ margin: 0 }}>{selectedUser.full_name}</h2>
                                    <p style={{ color: '#666', margin: 0 }}>@{selectedUser.username} | {selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="tabs">
                                <button
                                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('info')}
                                >
                                    Thông tin
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    Lịch sử hoạt động
                                </button>
                            </div>

                            <div className="tab-content">
                                {activeTab === 'info' && (
                                    <div className="info-tab">
                                        <div className="info-row">
                                            <span className="label">Vai trò:</span>
                                            <span className="value badge">{selectedUser.role}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Email:</span>
                                            <span className="value">{selectedUser.email || 'Chưa cập nhật'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Ngày tạo:</span>
                                            <span className="value">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="history-tab">
                                        {historyLoading ? <p>Đang tải lịch sử...</p> : (
                                            <div className="history-lists">
                                                <div className="history-section">
                                                    <h4>Đã tạo {userHistory.inbounds.length} Phiếu Nhập</h4>
                                                    <ul className="simple-list">
                                                        {userHistory.inbounds.slice(0, 10).map(o => (
                                                            <li key={o.id}>
                                                                <span className="code">{o.order_code}</span>
                                                                <span className="date">{new Date(o.createdAt).toLocaleDateString()}</span>
                                                                <span className="status success">{o.status}</span>
                                                            </li>
                                                        ))}
                                                        {userHistory.inbounds.length > 10 && <li>...và {userHistory.inbounds.length - 10} phiếu khác</li>}
                                                    </ul>
                                                </div>
                                                <div className="history-section">
                                                    <h4>Đã tạo {userHistory.outbounds.length} Phiếu Xuất</h4>
                                                    <ul className="simple-list">
                                                        {userHistory.outbounds.slice(0, 10).map(o => (
                                                            <li key={o.id}>
                                                                <span className="code">{o.order_code}</span>
                                                                <span className="date">{new Date(o.createdAt).toLocaleDateString()}</span>
                                                                <span className="status warning">{o.status}</span>
                                                            </li>
                                                        ))}
                                                        {userHistory.outbounds.length > 10 && <li>...và {userHistory.outbounds.length - 10} phiếu khác</li>}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>Chọn một nhân viên để xem chi tiết</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .hr-page { height: calc(100vh - 100px); display: flex; flex-direction: column; }
                .hr-content { display: flex; gap: 1rem; flex: 1; overflow: hidden; }
                .user-list { width: 300px; display: flex; flex-direction: column; overflow: hidden; }
                .list-container { flex: 1; overflow-y: auto; }
                .user-item { display: flex; gap: 10px; padding: 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
                .user-item:hover { background: #f8fafc; }
                .user-item.active { background: #e0f2fe; border-right: 3px solid var(--primary-color); }
                .avatar { width: 40px; height: 40px; background: #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; }
                .user-name { font-weight: 600; font-size: 0.9rem; }
                .user-role-badge { font-size: 0.75rem; color: #64748b; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 2px; }
                
                .user-details { flex: 1; padding: 2rem; display: flex; flex-direction: column; overflow-y: auto; }
                .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
                .detail-header { display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2rem; }
                .detail-avatar { width: 80px; height: 80px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; }
                
                .tabs { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
                .tab-btn { padding: 0.75rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 500; color: #64748b; }
                .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
                
                .info-row { display: flex; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
                .info-row .label { width: 120px; color: #64748b; }
                .info-row .value { font-weight: 500; }
                
                .history-lists { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .simple-list { list-style: none; padding: 0; }
                .simple-list li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.9rem; }
                .status.success { color: green; font-weight: bold; }
                .status.warning { color: orange; font-weight: bold; }
            `}</style>
        </div>
    );
};

export default HRPage;
