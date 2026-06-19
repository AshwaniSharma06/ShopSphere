export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '2px solid rgba(255,255,255,0.06)',
            borderTopColor: '#00D4FF',
          }}
        />
        <div
          className="absolute inset-1 rounded-full animate-spin"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#A855F7',
            animationDuration: '0.8s',
            animationDirection: 'reverse',
          }}
        />
      </div>
    </div>
  );
}
