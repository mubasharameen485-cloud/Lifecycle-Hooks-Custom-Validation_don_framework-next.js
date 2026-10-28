'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080/api/products';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 5;

  // 1. READ ALL (Fetch from Rust Backend)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${BACKEND_URL}?page=${page}&limit=${limit}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Backend connect nahi ho raha! Check karo backend chal raha hai ya nahi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  // 2. CREATE or UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        // UPDATE (PUT /api/products/:id)
        await axios.put(`${BACKEND_URL}/${editingId}`, {
          id: parseInt(editingId),
          name: name,
          price: parseInt(price),
        });
        setSuccess(`Product #${editingId} successfully update ho gaya!`);
        setEditingId(null);
      } else {
        // CREATE (POST /api/products)
        await axios.post(BACKEND_URL, {
          id: 0,
          name: name,
          price: parseInt(price),
        });
        setSuccess('Naya Product successfully add ho gaya!');
      }

      setName('');
      setPrice('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data || 'Request fail ho gayi!');
    }
  };

  // 3. DELETE (DELETE /api/products/:id)
  const handleDelete = async (id) => {
    if (!confirm(`Kya aap waqai Product #${id} delete karna chahte hain?`)) return;

    try {
      setError(null);
      setSuccess(null);
      await axios.delete(`${BACKEND_URL}/${id}`);
      setSuccess(`Product #${id} delete ho gaya!`);
      fetchProducts();
    } catch (err) {
      setError('Delete fail ho gaya!');
    }
  };

  // Edit Mode Start
  const startEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-indigo-600">🦀 Don Framework CRUD</h1>
        <p className="text-gray-500 text-sm mt-1">Rust Axum Backend + Next.js Frontend</p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2.5 rounded-lg mb-4 text-sm font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {editingId ? `✏️ Edit Product #${editingId}` : '➕ Add New Product'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-36">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Price ($)
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-white font-bold transition ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {editingId ? 'Update' : 'Add'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setPrice('');
                }}
                className="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-700">Inventory List</h2>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full">
            Page {page}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Data load ho raha hai...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Database khali hai. Upar se product add karo!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-400">#{p.id}</td>
                  <td className="p-4 font-bold text-gray-800">{p.name}</td>
                  <td className="p-4 text-emerald-600 font-bold font-mono">${p.price}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded hover:bg-amber-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="px-4 py-1.5 text-sm font-semibold border rounded-lg bg-white disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={products.length < limit || loading}
            className="px-4 py-1.5 text-sm font-semibold border rounded-lg bg-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}