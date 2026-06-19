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
