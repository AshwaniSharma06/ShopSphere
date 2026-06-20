import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Package,
  AlertCircle,
  Eye,
} from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/format';

export default function Products() {
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
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        productService.getProducts({ limit: 100 }), // retrieve a reasonably large set for admin
        categoryService.getCategories(),
      ]);
      setProducts(prodData.products || []);
      setCategories(catData.categories || catData || []);
    } catch (err) {
      console.error('Error fetching admin products data:', err);
      setError('Failed to load products or categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category match is checked by comparing product.category._id or product.category string
    const prodCatId = product.category?._id || product.category;
    const matchesCategory = !selectedCategory || prodCatId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-custom py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-frost flex items-center gap-2">
            <Package className="h-7 w-7 text-electric" /> Inventory Catalog
          </h1>
          <p className="text-sm text-smoke mt-1">
            Manage your store items, details, stocks, and category assignments.
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary text-sm py-2.5 px-4 font-semibold gap-2 self-start sm:self-auto rounded-xl">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, tags, description..."
            className="input-field w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field text-sm px-4 py-2.5 min-w-[200px]"
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
        <div className="text-center py-20 glass-card">
          <AlertCircle className="h-10 w-10 text-smoke mx-auto mb-3" />
          <p className="text-sm font-semibold text-frost">No products found</p>
          <p className="text-xs text-smoke mt-1">Try modifying your search queries or category filters</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-smoke uppercase tracking-wider bg-white/2">
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
                      className="border-b border-white/5 last:border-0 text-sm hover:bg-white/2 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-frost flex items-center gap-3">
                        <img
                          src={mainImage}
                          alt={product.title}
                          className="h-10 w-10 rounded-lg object-cover bg-white/5 shrink-0 border border-white/10"
                        />
                        <div className="truncate max-w-[200px]">
                          <p className="font-semibold text-frost truncate">{product.title}</p>
                          <p className="text-xs text-smoke truncate font-mono">{product._id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-mist font-medium">
                        {categoryName}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-frost">{formatCurrency(product.price)}</span>
                          {product.discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-plasma-bright">
                              -{product.discountPercent}% Off
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          product.stock === 0
                            ? 'bg-crimson/10 border border-crimson/20 text-crimson-bright'
                            : isLowStock
                            ? 'bg-amber/10 border border-amber/20 text-amber-bright animate-pulse'
                            : 'bg-plasma/10 border border-plasma/20 text-plasma-bright'
                        }`}>
                          {product.stock} left
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-electric/10 border border-electric/20 text-electric text-[10px] font-extrabold uppercase">
                              <Sparkles className="h-2.5 w-2.5" /> Featured
                            </span>
                          )}
                          {product.isTrending && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-neon/10 border border-neon/20 text-neon-bright text-[10px] font-extrabold uppercase">
                              Trending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-smoke hover:text-electric hover:bg-white/5 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.title)}
                            className="p-2 text-smoke hover:text-crimson-bright hover:bg-crimson/10 rounded-lg transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col z-10 glass-card border border-white/[0.08] shadow-glow-sm"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div>
                  <h3 className="text-lg font-bold text-frost">
                    {editingProduct ? 'Edit Product details' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-smoke mt-0.5">
                    {editingProduct ? `Modifying ID: ${editingProduct._id}` : 'Create a new catalog item'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-smoke hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="p-4 bg-crimson/10 border border-crimson/20 rounded-2xl text-sm text-crimson-bright font-semibold">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-smoke uppercase tracking-wide">Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formFields.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Wireless Bluetooth Headphones"
                    className="input-field w-full text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-smoke uppercase tracking-wide">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    value={formFields.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed product description..."
                    className="input-field w-full text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wide">Category *</label>
                    <select
                      name="category"
                      required
                      value={formFields.category}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wide">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="0"
                      value={formFields.stock}
                      onChange={handleInputChange}
                      placeholder="e.g. 50"
                      className="input-field w-full text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wide">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      value={formFields.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 2999"
                      className="input-field w-full text-sm"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-smoke uppercase tracking-wide">Discount Percent (%)</label>
                    <input
                      type="number"
                      name="discountPercent"
                      min="0"
                      max="100"
                      value={formFields.discountPercent}
                      onChange={handleInputChange}
                      placeholder="e.g. 15"
                      className="input-field w-full text-sm"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-smoke uppercase tracking-wide">Image URLs (comma separated)</label>
                  <input
                    type="text"
                    name="images"
                    value={formFields.images}
                    onChange={handleInputChange}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    className="input-field w-full text-sm"
                  />
                  <p className="text-[10px] text-smoke">Provide direct image links separated by a comma.</p>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-smoke uppercase tracking-wide">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formFields.tags}
                    onChange={handleInputChange}
                    placeholder="headphones, wireless, audio, electronics"
                    className="input-field w-full text-sm"
                  />
                  <p className="text-[10px] text-smoke">Search keywords separated by a comma.</p>
                </div>

                {/* Toggle Indicators */}
                <div className="flex gap-6 pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formFields.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded bg-white/5 border-white/10 text-electric focus:ring-electric focus:ring-offset-0"
                    />
                    <span className="text-sm font-semibold text-frost">Set as Featured</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isTrending"
                      checked={formFields.isTrending}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded bg-white/5 border-white/10 text-electric focus:ring-electric focus:ring-offset-0"
                    />
                    <span className="text-sm font-semibold text-frost">Set as Trending</span>
                  </label>
                </div>

                {/* Footer buttons inside form */}
                <div className="pt-6 border-t border-white/5 flex justify-end gap-3 bg-white/2 -mx-6 -mb-6 p-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary text-sm px-5 py-2.5 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm px-5 py-2.5 font-semibold gap-2 rounded-xl"
                  >
                    {submitting ? <Spinner size="sm" /> : 'Save Changes'}
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
}
