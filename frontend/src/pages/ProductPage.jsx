import { useEffect, useState } from 'react';
import productService from '../api/productService';
import { exportToCSV, isAdmin } from '../utils/helpers';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await productService.getAllProducts();
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to load products", err);
            // Mock data for display
            setProducts([
                { id: 1, name: "IPhone 13", price: 999, category: "Electronics" },
                { id: 2, name: "Samsung Galaxy S22", price: 899, category: "Electronics" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToCSV(products, 'products_list.csv');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-input"
                        style={{ width: '250px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleExport}>Export CSV</button>
                    {isAdmin() && <button className="btn-primary">Add Product</button>}
                </div>
            </div>

            <div className="card">
                {loading ? <p>Loading...</p> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td>#{p.id}</td>
                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>${p.price}</td>
                                    <td>
                                        {isAdmin() && (
                                            <>
                                                <button className="btn-small">Edit</button>
                                                <button className="btn-small danger">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <style>{`
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th, .data-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .data-table th {
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                .btn-small {
                    background: transparent;
                    border: 1px solid var(--text-secondary);
                    color: var(--text-primary);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    margin-right: 0.5rem;
                    font-size: 0.875rem;
                }
                .btn-small.danger {
                    border-color: #f87171;
                    color: #f87171;
                }
                .btn-small:hover {
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
        </div>
    );
};

export default ProductPage;
