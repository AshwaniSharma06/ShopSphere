import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../common/Skeleton';
import { ShoppingBag } from 'lucide-react';

export default function ProductGrid({ products, loading, emptyMessage }) {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 card text-center rounded-2xl">
        <div className="h-16 w-16 bg-white/5 text-smoke rounded-2xl flex items-center justify-center mb-5 border border-white/10">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-frost mb-2">
          No Products Found
        </h3>
        <p className="text-smoke max-w-sm text-sm">
          {emptyMessage || "We couldn't find any products matching your search criteria. Try removing some filters or search for something else."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
