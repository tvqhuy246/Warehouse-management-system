import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import { isAdmin, getUserRole } from '../utils/helpers';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-brand">
                    WMS <span className="brand-accent">Pro</span>
                </Link>
            </div>

            <div className="sidebar-menu">
                <div className="menu-category">MAIN</div>
                <Link to="/dashboard" className={`menu-item ${isActive('/dashboard')}`}>
                    <span className="icon">📊</span> Dashboard
                </Link>
                <Link to="/inventory" className={`menu-item ${isActive('/inventory')}`}>
                    <span className="icon">📦</span> Tồn kho
                </Link>

                <div className="menu-category">OPERATIONS</div>
                <Link to="/inbound" className={`menu-item ${isActive('/inbound')}`}>
                    <span className="icon">⬇️</span> Nhập kho
                </Link>
                <Link to="/outbound" className={`menu-item ${isActive('/outbound')}`}>
                    <span className="icon">⬆️</span> Xuất kho
                </Link>

                {isAdmin() && (
                    <>
                        <div className="menu-category">ADMINISTRATION</div>
                        <Link to="/products" className={`menu-item ${isActive('/products')}`}>
                            <span className="icon">🏷️</span> Sản phẩm
                        </Link>
                        <Link to="/categories" className={`menu-item ${isActive('/categories')}`}>
                            <span className="icon">📂</span> Danh mục
                        </Link>
                        <Link to="/locations" className={`menu-item ${isActive('/locations')}`}>
                            <span className="icon">📍</span> Vị trí kho
                        </Link>
                        <Link to="/partners" className={`menu-item ${isActive('/partners')}`}>
                            <span className="icon">🤝</span> Đối tác
                        </Link>
                        <Link to="/create-staff" className={`menu-item ${isActive('/create-staff')}`}>
                            <span className="icon">👤</span> Nhân viên
                        </Link>
                    </>
                )}
            </div>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-role">{getUserRole().toUpperCase()}</div>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    Đăng xuất
                </button>
            </div>

            <style>{`
                .sidebar {
                    width: 260px;
                    background-color: #1e293b;
                    color: #f8fafc;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    flex-shrink: 0;
                }
                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .sidebar-brand {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: white;
                    text-decoration: none;
                }
                .brand-accent {
                    color: #38bdf8;
                }
                .sidebar-menu {
                    flex: 1;
                    padding: 1.5rem 1rem;
                    overflow-y: auto;
                }
                .menu-category {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    margin-bottom: 0.5rem;
                    margin-top: 1.5rem;
                    padding-left: 0.75rem;
                    letter-spacing: 0.05em;
                }
                .menu-category:first-child {
                    margin-top: 0;
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem;
                    margin-bottom: 0.25rem;
                    border-radius: 6px;
                    color: #cbd5e1;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .menu-item:hover {
                    background-color: rgba(255,255,255,0.1);
                    color: white;
                }
                .menu-item.active {
                    background-color: #0ea5e9;
                    color: white;
                }
                .menu-item .icon {
                    margin-right: 0.75rem;
                    width: 20px;
                    text-align: center;
                }
                .sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                .user-info {
                    margin-bottom: 1rem;
                }
                .user-role {
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: rgba(255,255,255,0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    display: inline-block;
                    color: #38bdf8;
                }
                .btn-logout {
                    width: 100%;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #cbd5e1;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .btn-logout:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-color: white;
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
