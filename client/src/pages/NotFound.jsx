import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-mesh-move opacity-100"
             style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-mesh-move opacity-100"
             style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '-7s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full animate-mesh-move opacity-100"
             style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.04) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '-14s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="text-8xl font-black text-gradient mb-4 select-none"
          style={{ textShadow: '0 0 40px rgba(0,212,255,0.2)' }}
        >
          404
        </motion.div>
        
        <h1 className="text-2xl font-bold text-frost mb-2">
          Page Not Found
        </h1>
        <p className="text-smoke mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
