import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Sparkles, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/format';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if creating new
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discountPercent: '0',
    stock: '',
    tags: '',
    images: '',
    isFeatured: false,
    isTrending: false,
  });

  const fetchData = async () => {
    try {
      if (!user?._id) return;
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        productService.getProducts({ limit: 100, vendor: user._id }), // filter by vendor id
        categoryService.getCategories(),
      ]);
      setProducts(prodData.products || []);
      setCategories(catData.categories || catData || []);
    } catch (err) {
      console.error('Error fetching vendor products data:', err);
      setError('Failed to load products or categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormFields({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      discountPercent: '0',
      stock: '',
      tags: '',
      images: '',
      isFeatured: false,
      isTrending: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormFields({
      title: product.title || '',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      price: product.price || '',
      discountPercent: product.discountPercent?.toString() || '0',
      stock: product.stock || '',
      tags: product.tags?.join(', ') || '',
      images: product.images?.join(', ') || '',
      isFeatured: !!product.isFeatured,
      isTrending: !!product.isTrending,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Form validation
    if (!formFields.title || !formFields.description || !formFields.price || formFields.stock === '') {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    // Prepare fields
    const parsedData = {
      ...formFields,
      price: Number(formFields.price),
      discountPercent: Number(formFields.discountPercent),
      stock: Number(formFields.stock),
      tags: formFields.tags ? formFields.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      images: formFields.images ? formFields.images.split(',').map((img) => img.trim()).filter(Boolean) : [],
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, parsedData);
      } else {
        await productService.createProduct(parsedData);
      }
      setIsModalOpen(false);
      fetchData(); // reload
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Error occurred while saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        setLoading(true);
        const res = await productService.deleteProduct(id);
        if (res.success) {
          fetchData();
        } else {
          setError('Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.message || 'Error deleting product');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter products locally by search bar and category selector
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const prodCatId = product.category?._id || product.category;
    const matchesCategory = !selectedCategory || prodCatId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-custom py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-primary-500" /> Store Inventory
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage your store list, catalog details, pricing discounts, and stocks.
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary text-sm py-2.5 px-4 font-semibold gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, tags, description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border-0 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl bg-surface-50 dark:bg-surface-800 border-0 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 px-4 py-2.5 min-w-[200px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl">
          <AlertCircle className="h-10 w-10 text-surface-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-surface-500 dark:text-surface-400">No products found</p>
          <p className="text-xs text-surface-400 mt-1">Add items to your inventory storefront to view catalog lists.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-800 text-xs font-bold text-surface-400 uppercase tracking-wider bg-surface-50/50 dark:bg-surface-800/20">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Attributes</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80';
                  const isLowStock = product.stock <= 5;
                  const categoryName = product.category?.name || categories.find(c => c._id === product.category)?.name || 'General';
                  return (
                    <tr
                      key={product._id}
                      className="border-b border-surface-50 dark:border-surface-800/60 last:border-0 text-sm hover:bg-surface-50/30 dark:hover:bg-surface-800/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-surface-900 dark:text-white flex items-center gap-3">
                        <img
                          src={mainImage}
                          alt={product.title}
                          className="h-10 w-10 rounded-lg object-cover bg-surface-100 shrink-0 border border-surface-200/40"
                        />
                        <div className="truncate max-w-[200px]">
                          <p className="font-semibold text-surface-900 dark:text-white truncate">{product.title}</p>
                          <p className="text-xs text-surface-400 truncate font-mono">{product._id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-surface-600 dark:text-surface-300 font-medium">
                        {categoryName}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-surface-900 dark:text-white">{formatCurrency(product.price)}</span>
                          {product.discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              -{product.discountPercent}% Off
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-400 text-[10px] font-extrabold uppercase">
                              <Sparkles className="h-2.5 w-2.5" /> Featured
                            </span>
                          )}
                          {product.isTrending && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 text-[10px] font-extrabold uppercase">
                              Trending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-surface-500 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.title)}
                            className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col m-4 z-10"
            >
              <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/10">
                <div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                    {editingProduct ? 'Edit Product Details' : 'Add New Store Product'}
                  </h3>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {editingProduct ? `Modifying ID: ${editingProduct._id}` : 'List a new item in your storefront'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formFields.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Wireless Bluetooth Headphones"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    value={formFields.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed product description..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Category *</label>
                    <select
                      name="category"
                      required
                      value={formFields.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200/50 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      value={formFields.stock}
                      onChange={handleInputChange}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      value={formFields.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 2999"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Discount Percent (%)</label>
                    <input
                      type="number"
                      name="discountPercent"
                      min="0"
                      max="100"
                      value={formFields.discountPercent}
                      onChange={handleInputChange}
                      placeholder="e.g. 15"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    name="images"
                    value={formFields.images}
                    onChange={handleInputChange}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <p className="text-[10px] text-surface-400">Provide direct image links separated by a comma.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-surface-500 uppercase tracking-wide">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formFields.tags}
                    onChange={handleInputChange}
                    placeholder="headphones, wireless, audio, electronics"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <p className="text-[10px] text-surface-400">Search keywords separated by a comma.</p>
                </div>

                <div className="flex gap-6 pt-2 border-t border-surface-100 dark:border-surface-850">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formFields.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded bg-surface-50 text-primary-600 border-surface-200 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Set as Featured</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isTrending"
                      checked={formFields.isTrending}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded bg-surface-50 text-primary-600 border-surface-200 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Set as Trending</span>
                  </label>
                </div>

                <div className="pt-6 border-t border-surface-100 dark:border-surface-800 flex justify-end gap-3 bg-surface-50/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary text-sm px-5 py-2.5 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm px-5 py-2.5 font-semibold gap-2"
                  >
                    {submitting ? <Spinner size="sm" /> : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
