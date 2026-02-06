import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import OtpVerification from './otp-verification';

export default function SignupForm() {
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email blur event
  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  // Password strength validation
  const validatePasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (password.length === 0) return '';
    if (isLongEnough && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
      return 'strong';
    } else if (password.length >= 6 && ((hasUpperCase && hasLowerCase) || (hasNumber && hasLowerCase))) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordStrength(validatePasswordStrength(value));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      setStep('otp');
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  const handleOtpComplete = () => {
    localStorage.setItem('authToken', 'logged-in');
    localStorage.setItem('userEmail', email);
    navigate('/journal');
  };

  if (step === 'otp') {
    return <OtpVerification email={email} onComplete={handleOtpComplete} onBack={() => setStep('form')} />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">Join DheeVerse</h1>
            <p className="text-muted-foreground">Start your wellness journey today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={handleEmailBlur}
                  className={`w-full pl-12 pr-4 py-3 bg-background border-2 ${emailError ? 'border-destructive' : 'border-primary/30'} rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
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
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-500' : 
                    passwordStrength === 'medium' ? 'text-yellow-500' : 
                    passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {passwordStrength === 'weak' ? 'Weak' : 
                     passwordStrength === 'medium' ? 'Medium' : 
                     passwordStrength === 'strong' ? 'Strong' : ''}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Create Account
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


