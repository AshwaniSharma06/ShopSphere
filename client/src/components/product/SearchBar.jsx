import { Search, X, Mic } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, onVoiceClick }) {
  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-smoke group-focus-within:text-electric transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, brands, or categories..."
        className="input-field w-full pl-12 pr-24 py-3.5 rounded-2xl text-sm font-medium"
      />
      <div className="absolute inset-y-0 right-2 flex items-center gap-1">
        {value && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-smoke hover:text-frost hover:bg-white/5 transition-colors"
            type="button"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onVoiceClick}
          className="p-2 rounded-xl text-electric hover:bg-electric/10 transition-colors"
          type="button"
          aria-label="Voice search"
          title="Voice Search"
        >
          <Mic className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
