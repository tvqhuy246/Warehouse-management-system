import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../api/authService';
import { isAdmin, getUserRole } from '../utils/helpers';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('token');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    WMS <span className="logo-accent">Pro</span>
                </Link>
                <div className="nav-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
                            {isAdmin() && (
                                <Link to="/products" className={`nav-link ${isActive('/products')}`}>Products</Link>
                            )}
                            <Link to="/inventory" className={`nav-link ${isActive('/inventory')}`}>Inventory</Link>
                            <span className="user-badge">{getUserRole().toUpperCase()}</span>
                            <button onClick={handleLogout} className="btn-logout">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-primary">Login</Link>
                    )}
                </div>
            </div>
            <style>{`
                .navbar {
                    background-color: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .nav-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                }
                .nav-logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: white;
                }
                .logo-accent {
                    color: var(--secondary-color);
                }
                .nav-links {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }
                .nav-link {
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .nav-link:hover, .nav-link.active {
                    color: white;
                }
                .user-badge {
                    font-size: 0.75rem;
                    background: rgba(255,255,255,0.1);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    color: var(--secondary-color);
                    border: 1px solid var(--secondary-color);
                }
                .btn-logout {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: var(--text-secondary);
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                }
                .btn-logout:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
