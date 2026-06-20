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
        <h3 className="text-xs font-bold text-electric uppercase tracking-widest mb-3.5">
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-electric/10 text-electric border border-electric/20 shadow-glow-blue-sm'
                : 'text-mist hover:bg-white/5 hover:text-frost'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === category._id
                  ? 'bg-electric/10 text-electric border border-electric/20 shadow-glow-blue-sm'
                  : 'text-mist hover:bg-white/5 hover:text-frost'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Price Range Filter */}
      <div>
        <h3 className="text-xs font-bold text-electric uppercase tracking-widest mb-3.5">
          Price Range (₹)
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-smoke font-semibold uppercase">Min</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              className="input-field w-full pl-10 pr-2 py-2.5 text-sm rounded-xl"
            />
          </div>
          <span className="text-ash text-lg">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-smoke font-semibold uppercase">Max</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="100k"
              className="input-field w-full pl-10 pr-2 py-2.5 text-sm rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Rating Filter */}
      <div>
        <h3 className="text-xs font-bold text-electric uppercase tracking-widest mb-3.5">
          Customer Rating
        </h3>
        <div className="space-y-1">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => onSelectRating(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedRating === rating
                  ? 'bg-electric/10 text-electric border border-electric/20'
                  : 'text-mist hover:bg-white/5 hover:text-frost'
              }`}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < rating ? 'fill-amber text-amber' : 'text-ash'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs opacity-70">& Up</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="w-full btn-ghost gap-2 py-2.5 text-sm font-semibold text-smoke hover:text-electric"
      >
        <RotateCcw className="h-4 w-4" /> Reset Filters
      </button>
    </div>
  );
}
