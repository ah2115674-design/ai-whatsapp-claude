import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import {
  Plus,
  Upload,
  Search,
  Trash2,
  Edit2,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import Papa from 'papaparse';
import { cn, formatCurrency } from '../lib/utils';
import type { Product } from '../types';

export function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    moq: 1,
    price: 0,
    details: {} as any,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  async function fetchProducts() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (product?: Product) => {
    setFormError(null);
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        moq: product.moq,
        price: product.price,
        details: product.details || {},
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', moq: 1, price: 0, details: {} });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setFormError(null);
    try {
      const sanitizedData = {
        ...formData,
        price: isNaN(formData.price) ? 0 : formData.price,
        moq: isNaN(formData.moq) ? 1 : formData.moq,
        details: typeof formData.details === 'string' ? {} : formData.details,
      };
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(sanitizedData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...sanitizedData, user_id: user.id }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setFormData({ name: '', description: '', moq: 1, price: 0, details: {} });
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    setUploadError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const productsToInsert = (results.data as any[]).map((row) => {
            let details = {};
            if (row.details) {
              try {
                details = JSON.parse(row.details);
              } catch {
                details = {};
              }
            }
            return {
              user_id: user.id,
              name: row.name || 'Unnamed Product',
              description: row.description || '',
              moq: parseInt(row.moq) || 1,
              price: parseFloat(row.price) || 0,
              details,
            };
          });
          const { error } = await supabase.from('products').insert(productsToInsert);
          if (error) throw error;
          fetchProducts();
        } catch (err: any) {
          setUploadError(err.message || 'CSV upload failed. Check your file format.');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
          <p className="text-zinc-500">Manage your wholesale product catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload CSV
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </header>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{uploadError}</p>
          <button onClick={() => setUploadError(null)} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 text-zinc-400 mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">No products found</h3>
          <p className="text-zinc-500 mt-1">Start by adding a product or uploading a CSV file.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">MOQ</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-900">{formatCurrency(product.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-600">{product.moq} units</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={isNaN(formData.price) ? '' : formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">MOQ</label>
                  <input
                    type="number"
                    required
                    value={isNaN(formData.moq) ? '' : formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Details (JSON)</label>
                <textarea
                  rows={2}
                  placeholder='{"color": "red", "size": "XL"}'
                  value={
                    typeof formData.details === 'object'
                      ? JSON.stringify(formData.details)
                      : formData.details
                  }
                  onChange={(e) => {
                    try {
                      setFormData({ ...formData, details: JSON.parse(e.target.value) });
                    } catch {
                      setFormData({ ...formData, details: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono text-xs"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Product?</h3>
            <p className="text-zinc-500 mb-6">This action cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
