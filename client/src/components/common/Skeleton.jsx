export default function Skeleton({ className = '', variant = 'rect' }) {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    title: 'rounded h-6 w-3/4',
    avatar: 'rounded-full h-10 w-10',
    card: 'rounded-2xl h-64',
    image: 'rounded-xl aspect-square',
  };

  return (
    <div className={`skeleton ${variants[variant]} ${className}`}>&nbsp;</div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card p-4 space-y-4 animate-fade-in">
      <Skeleton variant="image" className="w-full" />
      <div className="space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant="text" className="w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
