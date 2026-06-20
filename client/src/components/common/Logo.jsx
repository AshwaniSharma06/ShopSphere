export default function Logo({ className = "h-8 w-8", glow = true }) {
  return (
    <svg 
      className={`${className}`} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer cyber sphere ring - slowly rotating */}
      <circle 
        cx="16" 
        cy="16" 
        r="13" 
        stroke="url(#logo-grad)" 
        strokeWidth="1.5" 
        strokeDasharray="6 3 2 3" 
        style={{ 
          transformOrigin: '16px 16px', 
          animation: 'spin 16s linear infinite' 
        }} 
      />
      
      {/* Inner S-shaped orbital curves */}
      <path 
        d="M10 11C10 8.5 12.5 6.5 16 6.5C19.5 6.5 22 8.5 22 11C22 14.5 10 16.5 10 20C10 23.5 12.5 25.5 16 25.5C19.5 25.5 22 23.5 22 20" 
        stroke="url(#logo-grad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter={glow ? "url(#logo-glow)" : undefined}
      />
      
      {/* Cyber core dot */}
      <circle 
        cx="16" 
        cy="16" 
        r="2" 
        fill="#00D4FF" 
        filter={glow ? "url(#logo-glow)" : undefined} 
      />
    </svg>
  );
}
