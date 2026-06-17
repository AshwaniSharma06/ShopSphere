import { Star, RotateCcw } from 'lucide-react';

export default function ProductFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  selectedRating,
  onSelectRating,
  onClearFilters,
}) {
  const ratings = [4, 3, 2, 1];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-3.5">
          Categories
        </h3>
        <div className="space-y-2.5">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold'
                : 'text-surface-650 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850 hover:text-surface-900 dark:hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === category._id
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-surface-650 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* Price Range Filter */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-3.5">
          Price Range (₹)
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-400 font-medium">Min</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-2 py-2 text-sm rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <span className="text-surface-400">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-surface-400 font-medium">Max</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="100k"
              className="w-full pl-10 pr-2 py-2 text-sm rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* Rating Filter */}
      <div>
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-3.5">
          Customer Rating
        </h3>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => onSelectRating(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRating === rating
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold'
                  : 'text-surface-650 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-850 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-current' : 'text-surface-300 dark:text-surface-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs">& Up</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-surface-200 dark:border-surface-800" />

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-850 text-sm font-medium text-surface-700 dark:text-surface-300 transition-all active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" /> Reset Filters
      </button>
    </div>
  );
}
