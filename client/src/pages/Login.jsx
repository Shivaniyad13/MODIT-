import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { login, error, clearError, loading, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear errors when entering the page
  useEffect(() => {
    clearError();
    setValidationError('');
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || `/dashboard/${user.role}`;
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(`/dashboard/${result.user.role}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand-500/20">
            M
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight font-sans">
          Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-500">MODIT</span>
        </h2>
        <p className="mt-2 text-center text-sm text-dark-400">
          Or{' '}
          <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel rounded-2xl py-8 px-4 shadow-xl sm:px-10 border-dark-800/80">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error alerts */}
            {(validationError || error) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-300 font-medium">{validationError || error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-dark-500" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-500" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Dummy account hints */}
          <div className="mt-6 pt-6 border-t border-dark-800/80">
            <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Demo Credentials (Available after seeding)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-dark-400">
              <div>
                <span className="font-medium text-dark-300">Customer:</span> customer@modit.com
              </div>
              <div>
                <span className="font-medium text-dark-300">Contractor:</span> builder@modit.com
              </div>
              <div>
                <span className="font-medium text-dark-300">Supplier:</span> supplier@modit.com
              </div>
              <div>
                <span className="font-medium text-dark-300">Admin:</span> admin@modit.com
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-dark-500 italic">
              Password: password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
