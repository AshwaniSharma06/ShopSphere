import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { name: formData.name, phone: formData.phone };
      if (formData.password) updateData.password = formData.password;
      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-2xl font-bold text-frost mb-6">
          My Profile
        </h1>

        <div className="glass-card p-6 sm:p-8">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-electric to-neon flex items-center justify-center shadow-glow">
              <span className="text-2xl font-bold text-obsidian">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-frost">
                {user?.name}
              </h2>
              <p className="text-sm text-smoke">{user?.email}</p>
              <span className="badge-primary mt-1 capitalize">{user?.role}</span>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mb-6 p-3 rounded-xl bg-plasma/10 border border-plasma/20 text-plasma-bright text-sm font-medium text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-crimson/10 border border-crimson/20 text-crimson-bright text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={User} />
            <Input label="Email Address" name="email" type="email" value={formData.email} disabled icon={Mail} />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" icon={Phone} />
            <Input label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" />

            <Button type="submit" loading={loading} className="w-full sm:w-auto gap-2" size="lg">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
