import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useUser } from "../lib/user-context";
import { API_BASE } from "../lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useUser();

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store JWT token and user data
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      if (data.user) {
        localStorage.setItem("userEmail", data.user.email || email);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Update user context
      if (updateUser && data.user) {
        updateUser(data.user);
      }

      // Show success notification
      toast.success("Login successful!", {
        description: `Welcome back, ${data.user?.name || "User"}!`,
      });

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error("Login failed", {
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setForgotPasswordLoading(true);
    setForgotPasswordSuccess(false);

    try {
      if (!forgotPasswordEmail) {
        setError("Please enter your email address");
        setForgotPasswordLoading(false);
        return;
      }

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        setForgotPasswordLoading(false);
        return;
      }

      setForgotPasswordSuccess(true);
      setForgotPasswordLoading(false);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">
              Continue your wellness journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground block"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 pointer-events-none z-10" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground block"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 pointer-events-none z-10" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--primary)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Forgot Password?
              </h2>
              <p className="text-muted-foreground mb-6">
                Enter your email address and we'll send you a code to reset your
                password.
              </p>

              {forgotPasswordSuccess ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 text-green-600 rounded-lg p-3 text-sm">
                    If the email exists, a password reset code has been sent.
                    Please check your inbox.
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setForgotPasswordSuccess(false);
                        navigate("/reset-password", {
                          state: { email: forgotPasswordEmail },
                        });
                      }}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-full font-semibold hover:opacity-90 transition"
                    >
                      Continue to Reset
                    </button>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setForgotPasswordSuccess(false);
                      }}
                      className="flex-1 bg-muted text-foreground py-2 rounded-full font-semibold hover:opacity-90 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full mt-2 px-4 py-3 bg-background border-2 border-primary/30 rounded-xl focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordLoading ? "Sending..." : "Send Reset Code"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setError("");
                      }}
                      className="flex-1 bg-muted text-foreground py-2 rounded-full font-semibold hover:opacity-90 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
