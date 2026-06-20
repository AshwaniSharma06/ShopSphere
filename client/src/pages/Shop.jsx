import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, Mic, AlertCircle } from 'lucide-react';
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

  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          updateQueryParam('search', transcript);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission is blocked. Please enable it in browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Please try again.');
        } else {
          setVoiceError(`Voice search error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(rec);
    }
  }, []);

  const handleVoiceSearch = () => {
    if (!speechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    try {
      speechRecognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
    }
  };

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
          <h1 className="text-3xl font-extrabold text-frost tracking-tight">
            Discover Products
          </h1>
          <p className="text-smoke text-sm mt-1">
            Browse through our curated collection of premium products
          </p>
        </div>
        <div
          className="text-sm font-semibold text-smoke px-4 py-2.5 rounded-xl self-start"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Showing <span className="text-electric">{products.length}</span> of {totalProducts} items
        </div>
      </div>

      {/* Control Strip (Search, Mobile Filter Toggle, Sort) */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="flex-1 w-full">
          <SearchBar
            value={searchVal}
            onChange={(val) => updateQueryParam('search', val)}
            onClear={() => updateQueryParam('search', '')}
            onVoiceClick={handleVoiceSearch}
          />
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden btn-secondary gap-2 px-4 py-3 text-sm font-medium"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex-1 md:flex-initial flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-bold text-mist uppercase tracking-wider">
              Sort By:
            </span>
            <div className="relative flex-grow">
              <select
                value={sortVal}
                onChange={(e) => updateQueryParam('sort', e.target.value)}
                className="input-field w-full pl-4 pr-10 py-3 rounded-xl text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
              <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Filter Sidebar (Desktop only) */}
        <aside
          className="hidden md:block w-64 shrink-0 rounded-2xl p-6 sticky top-20"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
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
            <div
              className="flex items-center justify-center gap-2 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-smoke hover:text-frost hover:bg-white/[0.05]"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
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
                          ? 'text-obsidian font-bold'
                          : 'text-mist hover:text-frost hover:bg-white/[0.05]'
                      }`}
                      style={
                        currentPage === pageNumber
                          ? {
                              background: 'linear-gradient(135deg, #00D4FF, #00A3CC)',
                              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                            }
                          : { border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-smoke hover:text-frost hover:bg-white/[0.05]"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full shadow-glass-lg p-6 z-50 overflow-y-auto md:hidden"
              style={{
                background: 'rgba(17,17,17,0.97)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-frost">
                  Filter Products
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-smoke hover:text-frost hover:bg-white/[0.05] transition-colors"
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

      {/* Voice Search Listening Overlay */}
      <AnimatePresence>
        {(isListening || voiceError) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (speechRecognition) speechRecognition.stop();
                setVoiceError(null);
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Overlay Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md glass-3 rounded-3xl p-8 text-center shadow-glass-lg m-4 z-10 space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  if (speechRecognition) speechRecognition.stop();
                  setVoiceError(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl text-smoke hover:text-frost hover:bg-white/[0.05] transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {voiceError ? (
                // Error State
                <div className="space-y-6">
                  <div
                    className="h-16 w-16 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <AlertCircle className="h-8 w-8 text-crimson-bright" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-frost">Voice Search Failed</h3>
                    <p className="text-sm text-smoke leading-relaxed">
                      {voiceError}
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setVoiceError(null)}
                      className="btn-secondary text-sm px-6 py-2.5 font-semibold"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setVoiceError(null);
                        handleVoiceSearch();
                      }}
                      className="btn-primary text-sm px-6 py-2.5 font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                // Listening State
                <div className="space-y-6">
                  {/* Pulsing Visualizer */}
                  <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(0,212,255,0.1)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                      className="absolute inset-2 rounded-full"
                      style={{ background: 'rgba(0,212,255,0.15)' }}
                    />
                    <div
                      className="relative h-16 w-16 rounded-full flex items-center justify-center text-obsidian"
                      style={{
                        background: 'linear-gradient(135deg, #00D4FF, #00A3CC)',
                        boxShadow: '0 0 30px rgba(0,212,255,0.3)',
                      }}
                    >
                      <Mic className="h-7 w-7 animate-pulse-soft" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-frost tracking-tight">Listening for Search...</h3>
                    <p className="text-sm text-smoke">
                      Please speak clearly into your microphone
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-2xl text-xs text-smoke space-y-2"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <p className="font-bold text-mist uppercase tracking-wider">Example Queries</p>
                    <p>"headphones" • "smart watch" • "denim jacket"</p>
                  </div>

                  <button
                    onClick={() => {
                      if (speechRecognition) speechRecognition.stop();
                    }}
                    className="btn-secondary text-sm px-6 py-2.5 font-semibold w-full"
                  >
                    Cancel Listening
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
