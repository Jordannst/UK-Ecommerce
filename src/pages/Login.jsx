import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(`Selamat datang, ${result.user.name}! 👋`);
      // Redirect based on user role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error || 'Login gagal. Silakan coba lagi.');
      toast.error('Login gagal. Periksa email dan password Anda.');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Quick login buttons for demo
  const quickLogin = async (email, password) => {
    setFormData({ email, password });
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success(`Selamat datang, ${result.user.name}! 👋`);
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error || 'Login gagal. Silakan coba lagi.');
      toast.error('Login gagal');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-unklab-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">U</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-unklab-blue">UNKLAB</span>
              <span className="text-xs text-gray-500">Campus Store</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Masuk ke Akun</h2>
          <p className="mt-2 text-gray-600">Selamat datang kembali!</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="nama@student.unklab.ac.id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-unklab-blue font-medium hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Demo Quick Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">Demo Login Cepat:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickLogin('john@student.unklab.ac.id', 'password123')}
                className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
              >
                👤 Login sebagai User
              </button>
              <button
                type="button"
                onClick={() => quickLogin('admin@unklab.ac.id', 'admin123')}
                className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                🔐 Login sebagai Admin
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-unklab-blue">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
