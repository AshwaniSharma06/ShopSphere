import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function Register() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full animate-mesh-move"
             style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full animate-mesh-move"
             style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '-7s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
                 style={{ background: 'linear-gradient(135deg, #A855F7, #00D4FF)', boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}>
              <UserPlus className="h-7 w-7 text-obsidian" />
            </div>
            <h1 className="text-2xl font-bold text-frost">Create Account</h1>
            <p className="text-smoke mt-1 text-sm">Join ShopSphere and start shopping</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl text-sm font-medium text-center"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" type="text" name="name" value={formData.name}
              onChange={handleChange} placeholder="John Doe" icon={User} error={formErrors.name} required />
            <Input label="Email Address" type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="you@example.com" icon={Mail} error={formErrors.email} required />
            <Input label="Password" type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="At least 6 characters" icon={Lock} error={formErrors.password} required />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} placeholder="Re-enter your password" icon={Lock} error={formErrors.confirmPassword} required />
            <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
          </form>

          <p className="text-center mt-6 text-sm text-smoke">
            Already have an account?{' '}
            <Link to="/login" className="text-electric font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
