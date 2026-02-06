import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: OTP and password
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If email is passed from forgot password flow, set it
    if (location.state?.email) {
      setEmail(location.state.email);
      setStep(2);
    }
  }, [location]);

  // Password strength validation
  const validatePasswordStrength = (password) => {
    if (password.length === 0) return '';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'~`]/.test(password);
    const isLongEnough = password.length >= 8;

    let strength = 0;
    if (isLongEnough) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    // Strong: 8+ chars with at least 4 criteria (upper, lower, number, special)
    if (strength >= 4 && isLongEnough) {
      return 'strong';
    } 
    // Medium: 8+ chars with at least 3 criteria
    else if (strength >= 3 && isLongEnough) {
      return 'medium';
    } 
    // Weak: everything else
    else {
      return 'weak';
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset code');
        setLoading(false);
        return;
      }

      setStep(2);
      setLoading(false);
    } catch (err) {
      setError('Failed to send reset code. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const strength = validatePasswordStrength(newPassword);
    if (strength === 'weak') {
      setError('Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      // Success - redirect to login
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully. Please login with your new password.' } });
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground">
              {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-muted border-2 border-border rounded-xl text-foreground opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Reset Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 8 characters)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordStrength(validatePasswordStrength(e.target.value));
                    }}
                    className="w-full pl-12 pr-12 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === 'weak' ? 'bg-red-500' : 
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-500' : 
                      passwordStrength === 'medium' ? 'text-yellow-500' : 
                      passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {passwordStrength === 'weak' ? 'Weak password' : 
                       passwordStrength === 'medium' ? 'Medium strength' : 
                       passwordStrength === 'strong' ? 'Strong password' : ''}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



