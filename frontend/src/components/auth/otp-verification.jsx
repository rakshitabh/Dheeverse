import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { API_BASE } from '../../lib/api';

export default function OtpVerification({ email, onComplete, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.querySelector(`#otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      const otpCode = otp.join('');
      console.log('Verifying OTP for email:', email, 'OTP:', otpCode);

      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      console.log('Verify response:', data);

      if (!response.ok) {
        console.error('OTP verification failed:', data.error);
        setIsVerifying(false);
        return;
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      console.log('Resending OTP to:', email);
      const response = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Resend response:', data);

      if (!response.ok) {
        setResendMessage('Failed to resend OTP: ' + (data.error || 'Unknown error'));
      } else {
        setResendMessage('OTP resent to your email!');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.log('Error resending OTP:', error);
      setResendMessage('Error resending OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const otpFilled = otp.every((digit) => digit !== '');

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-primary hover:opacity-70 transition mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-foreground">Verify Your Email</h2>
            <p className="text-muted-foreground">Enter the OTP sent to {email}</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-14 h-14 text-center text-xl font-semibold bg-background border-2 border-primary/30 rounded-2xl focus:outline-none focus:border-primary transition text-foreground"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the OTP?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : 'Resend OTP'}
                </button>
              </p>
              {resendMessage && (
                <p
                  className={`text-sm mt-2 ${
                    resendMessage.includes('Failed') || resendMessage.includes('Error')
                      ? 'text-destructive'
                      : 'text-green-600'
                  }`}
                >
                  {resendMessage}
                </p>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={!otpFilled || isVerifying}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


