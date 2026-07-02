import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, Lock, Building, FileText, MapPin, AlertTriangle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError, loading, user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    businessName: '',
    gstin: '',
    addressLabel: 'Primary Office',
    addressLine1: '',
    addressPincode: '',
    addressZone: 'Delhi'
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    clearError();
    setValidationError('');
  }, []);

  useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Force GSTIN to uppercase in state, not just CSS display
      [name]: name === 'gstin' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const {
      name,
      email,
      phone,
      password,
      role,
      businessName,
      gstin,
      addressLine1,
      addressPincode,
      addressZone,
      addressLabel
    } = formData;

    // Check common validations
    if (!name || !email || !phone || !password) {
      setValidationError('Please fill in all basic fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Role-specific check
    if ((role === 'contractor' || role === 'supplier') && !businessName) {
      setValidationError('Business Name is required.');
      return;
    }

    if (role === 'supplier' && !gstin) {
      setValidationError('GSTIN is required for suppliers.');
      return;
    }

    if (role === 'supplier' && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstin)) {
      setValidationError('Please enter a valid 15-digit GSTIN.');
      return;
    }

    // Optional address parsing (required if filled)
    let addresses = [];
    if (addressLine1 && addressPincode) {
      if (!/^\d{6}$/.test(addressPincode)) {
        setValidationError('Please enter a valid 6-digit pincode.');
        return;
      }
      addresses.push({
        label: addressLabel,
        line1: addressLine1,
        city: 'Delhi NCR',
        pincode: addressPincode,
        zone: addressZone
      });
    }

    const payload = {
      name,
      email,
      phone,
      password,
      role,
      businessName: (role === 'contractor' || role === 'supplier') ? businessName : undefined,
      gstin: role === 'supplier' ? gstin : undefined,
      addresses
    };

    const result = await register(payload);
    if (result.success) {
      navigate(`/dashboard/${result.user.role}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand-500/20">
            M
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight font-sans">
          Register with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-500">MODIT</span>
        </h2>
        <p className="mt-2 text-center text-sm text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="glass-panel rounded-2xl py-8 px-6 shadow-xl sm:px-10 border-dark-800/80">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error alerts */}
            {(validationError || error) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-300 font-medium">{validationError || error}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300">Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-dark-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="glass-input w-full pl-9"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-dark-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="glass-input w-full pl-9"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300">Mobile Phone</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-dark-500" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="glass-input w-full pl-9"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-dark-500" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input w-full pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Select Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['customer', 'contractor', 'supplier'].map((r) => (
                  <label
                    key={r}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all capitalize font-medium text-sm ${
                      formData.role === r
                        ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg shadow-brand-500/10'
                        : 'border-dark-800 bg-dark-900/40 text-dark-400 hover:border-dark-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={formData.role === r}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Business Info */}
            {(formData.role === 'contractor' || formData.role === 'supplier') && (
              <div className="space-y-4 pt-4 border-t border-dark-800/80">
                <h3 className="text-sm font-semibold text-white tracking-wide">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300">Registered Business Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-dark-500" />
                      </div>
                      <input
                        type="text"
                        name="businessName"
                        required
                        value={formData.businessName}
                        onChange={handleChange}
                        className="glass-input w-full pl-9"
                        placeholder="ABC Construction Ltd."
                      />
                    </div>
                  </div>

                  {formData.role === 'supplier' && (
                    <div>
                      <label className="block text-sm font-medium text-dark-300">GSTIN Number</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-4 w-4 text-dark-500" />
                        </div>
                        <input
                          type="text"
                          name="gstin"
                          required
                          value={formData.gstin}
                          onChange={handleChange}
                          className="glass-input w-full pl-9 uppercase"
                          placeholder="07AAAAA1111A1Z1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address Setup */}
            <div className="space-y-4 pt-4 border-t border-dark-800/80">
              <h3 className="text-sm font-semibold text-white tracking-wide">Address (Optional for Signup)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-dark-300">Address Line</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-dark-500" />
                    </div>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="glass-input w-full pl-9"
                      placeholder="123, Sector 4, MG Road"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300">Pincode</label>
                  <input
                    type="text"
                    name="addressPincode"
                    value={formData.addressPincode}
                    onChange={handleChange}
                    className="glass-input w-full mt-1"
                    placeholder="110001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300">Delhi NCR Zone</label>
                  <select
                    name="addressZone"
                    value={formData.addressZone}
                    onChange={handleChange}
                    className="glass-input w-full mt-1"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Noida">Noida</option>
                    <option value="Faridabad">Faridabad</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300">Address Label</label>
                  <input
                    type="text"
                    name="addressLabel"
                    value={formData.addressLabel}
                    onChange={handleChange}
                    className="glass-input w-full mt-1"
                    placeholder="Primary Office"
                  />
                </div>
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
                    Creating Account...
                  </>
                ) : (
                  'Register Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
