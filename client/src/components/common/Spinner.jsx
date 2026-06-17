export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-[3px] border-surface-200 border-t-primary-600 dark:border-surface-700 dark:border-t-primary-400`}
      />
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="xl" />
        <p className="text-surface-500 dark:text-surface-400 text-sm animate-pulse-soft">
          Loading...
        </p>
      </div>
    </div>
  );
}
