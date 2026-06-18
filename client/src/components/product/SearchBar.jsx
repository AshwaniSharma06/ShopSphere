import { Search, X, Mic } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, onVoiceClick }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-surface-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, brands, or categories..."
        className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
      />
      <div className="absolute inset-y-0 right-2 flex items-center gap-1">
        {value && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-surface-450 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            type="button"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onVoiceClick}
          className="p-2 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors"
          type="button"
          aria-label="Voice search"
          title="Voice Search"
        >
          <Mic className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
