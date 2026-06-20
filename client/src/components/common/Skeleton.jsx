export default function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'h-4 w-full',
    circle: 'h-10 w-10 rounded-full',
    card: 'h-48 w-full rounded-2xl',
    title: 'h-6 w-3/4',
    text: 'h-3 w-full',
    avatar: 'h-8 w-8 rounded-lg',
  };

  return (
    <div className={`skeleton ${variants[variant] || variants.rect} ${className}`} />
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-card p-4 space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="title" />
          <Skeleton variant="text" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
