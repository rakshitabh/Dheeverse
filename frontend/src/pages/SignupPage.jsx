import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import OtpVerification from "../components/auth/otp-verification.jsx";
import { API_BASE } from "../lib/api";
import { useUser } from "../lib/user-context";

export default function SignupPage() {
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { updateUser } = useUser();

  // Clear error when step changes or component mounts
  useEffect(() => {
    setError("");
  }, [step]);

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

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordStrength(validatePasswordStrength(value));
    if (submitted) {
      setError(""); // Clear error when user types after submission
    }
  };

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (submitted) {
      // Only validate after form has been submitted
      if (value && !validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
      setError(""); // Clear general error
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError(""); // Clear any previous errors
    setEmailError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Check response status
      if (!response.ok) {
        // Only set error if it's actually an error (not 201 success)
        if (response.status !== 201) {
          setError(data.error || data.message || "Signup failed");
          return;
        }
      }

      // Success - clear error and proceed to OTP
      setError(""); // Explicitly clear error on success
      setStep("otp");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
    }
  };

  const handleOtpComplete = async () => {
    // After OTP verification, log the user in to receive a real token
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login after verification failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      if (data.user) {
        localStorage.setItem("userEmail", data.user.email || email);
        localStorage.setItem("user", JSON.stringify(data.user));
        updateUser?.(data.user);
      }

      navigate("/dashboard", { replace: true });
    } catch (loginErr) {
      setError("Login after verification failed. Please try logging in.");
    }
  };

  if (step === "otp") {
    return (
      <OtpVerification
        email={email}
        onComplete={handleOtpComplete}
        onBack={() => {
          setError(""); // Clear error when going back
          setStep("form");
        }}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Join DheeVerse
            </h1>
            <p className="text-muted-foreground">
              Start your wellness journey today
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              {submitted && emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-background border-2 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground ${
                    submitted && emailError ? 'border-destructive' : 'border-primary/30'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
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
              <label className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
