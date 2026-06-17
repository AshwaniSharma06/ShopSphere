import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import SearchBar from '../components/product/SearchBar';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for products and query parameters
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Pagination metadata
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Search, Filters & Sorting state sync'd with URL Search Params
  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || '';
  const minPriceVal = searchParams.get('minPrice') || '';
  const maxPriceVal = searchParams.get('maxPrice') || '';
  const ratingVal = searchParams.get('rating') || '';
  const sortVal = searchParams.get('sort') || 'newest';
  const pageVal = Number(searchParams.get('page')) || 1;

  // Mobile Filter Drawer Toggle State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error.message);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page: pageVal,
          limit: 12,
          sort: sortVal,
        };
        if (searchVal) queryParams.search = searchVal;
        if (categoryVal) queryParams.category = categoryVal;
        if (minPriceVal) queryParams.minPrice = minPriceVal;
        if (maxPriceVal) queryParams.maxPrice = maxPriceVal;
        if (ratingVal) queryParams.rating = ratingVal;

        const data = await productService.getProducts(queryParams);
        if (data.success) {
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setTotalPages(data.pages || 1);
          setCurrentPage(data.page || 1);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchVal, categoryVal, minPriceVal, maxPriceVal, ratingVal, sortVal, pageVal]);

  // Sync Search Query Updates
  const updateQueryParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Always reset page to 1 on filter/search change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  // Helper clear filters
  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  };

  // Pagination Change handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateQueryParam('page', page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container-custom py-10">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Discover Products
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Browse through our curated collection of premium products
          </p>
        </div>
        <div className="text-sm font-semibold text-surface-500 dark:text-surface-450 bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 px-4 py-2.5 rounded-xl shadow-sm self-start">
          Showing <span className="text-primary-600 dark:text-primary-400">{products.length}</span> of {totalProducts} items
        </div>
      </div>

      {/* Control Strip (Search, Mobile Filter Toggle, Sort) */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex-1 w-full">
          <SearchBar
            value={searchVal}
            onChange={(val) => updateQueryParam('search', val)}
            onClear={() => updateQueryParam('search', '')}
            onVoiceClick={() => alert('Voice search will be configured in Phase 7.')}
          />
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-50 text-sm font-medium transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex-1 md:flex-initial flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-semibold text-surface-450 uppercase tracking-wider">
              Sort By:
            </span>
            <div className="relative flex-grow">
              <select
                value={sortVal}
                onChange={(e) => updateQueryParam('sort', e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-sm font-medium text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
              <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Filter Sidebar (Desktop only) */}
        <aside className="hidden md:block w-64 shrink-0 bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 shadow-sm sticky top-20">
          <ProductFilters
            categories={categories}
            selectedCategory={categoryVal}
            onSelectCategory={(catId) => updateQueryParam('category', catId)}
            minPrice={minPriceVal}
            onMinPriceChange={(val) => updateQueryParam('minPrice', val)}
            maxPrice={maxPriceVal}
            onMaxPriceChange={(val) => updateQueryParam('maxPrice', val)}
            selectedRating={ratingVal ? Number(ratingVal) : ''}
            onSelectRating={(rate) => updateQueryParam('rating', rate)}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Right Main Grid & Pagination */}
        <div className="flex-1 w-full space-y-8">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage="No products match your filters. Try adjusting price range or clearing all inputs."
          />

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-surface-200/50 dark:border-surface-800/50">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-850 text-surface-600 dark:text-surface-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                        currentPage === pageNumber
                          ? 'bg-primary-600 text-white shadow-glow'
                          : 'border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-850 text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-850 text-surface-600 dark:text-surface-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-surface-900 shadow-xl border-r border-surface-200 dark:border-surface-800 p-6 z-50 overflow-y-auto md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  Filter Products
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ProductFilters
                categories={categories}
                selectedCategory={categoryVal}
                onSelectCategory={(catId) => updateQueryParam('category', catId)}
                minPrice={minPriceVal}
                onMinPriceChange={(val) => updateQueryParam('minPrice', val)}
                maxPrice={maxPriceVal}
                onMaxPriceChange={(val) => updateQueryParam('maxPrice', val)}
                selectedRating={ratingVal ? Number(ratingVal) : ''}
                onSelectRating={(rate) => updateQueryParam('rating', rate)}
                onClearFilters={handleClearFilters}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
