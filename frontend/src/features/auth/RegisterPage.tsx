import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { GeometricLogo } from '../../components/common/GeometricLogo';
import { registerUser } from '../../lib/api/auth';

interface RegisterPageProps {
  onRegisterSuccess: (requiresLogin: boolean) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please provide a properly formatted email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        email: cleanEmail,
        password: password,
        username: username.trim() || undefined,
        full_name: fullName.trim() || undefined,
      });

      // If backend returned a token, onRegisterSuccess(false) logs in directly
      // If backend didn't return a token, require separate login
      const hasToken = Boolean(response.access_token || response.token);
      if (hasToken) {
        onRegisterSuccess(false);
      } else {
        setSuccessNotice('Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          onRegisterSuccess(true);
        }, 1200);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F8FA] text-[#292C33] flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      {/* Subtle atmospheric ambient glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-tr from-[#ECEBFF]/50 via-[#EAF3FF]/40 to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      {/* Top Bar / Brand header */}
      <div className="w-full max-w-5xl px-6 py-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <GeometricLogo size={30} />
          <span className="font-semibold text-[16px] tracking-tight text-[#292C33]">
            CyberGuard AI
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] px-4 py-8 my-auto">
        <div className="bg-white border border-[#E7E8ED] rounded-2xl shadow-xl p-7 sm:p-8 flex flex-col">
          {/* Card Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#ECEBFF] flex items-center justify-center mb-3">
              <GeometricLogo size={26} />
            </div>
            <h1 className="text-xl font-semibold text-[#292C33] tracking-tight">
              Create Analyst Account
            </h1>
            <p className="text-xs text-[#737782] mt-1 font-normal">
              Register to access threat intelligence graphs and investigation tools
            </p>
          </div>

          {/* Success Notice */}
          {successNotice && (
            <div className="mb-5 p-3 rounded-xl bg-[#E8F6EF] border border-[#D0EFE0] text-xs text-[#248259] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#3BAA78]" />
              <span className="leading-relaxed font-medium">{successNotice}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-[#FCEBED] border border-[#F8D2D7] text-xs text-[#B83E4C] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#292C33]">
                Email Address <span className="text-[#625FEF]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A9DA6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@enterprise.local"
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#292C33]">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9A9DA6] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="analyst_sec"
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#292C33]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivers"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#292C33]">
                Password <span className="text-[#625FEF]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A9DA6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-10 py-2 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF] focus:bg-white transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#9A9DA6] hover:text-[#292C33] absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#292C33]">
                Confirm Password <span className="text-[#625FEF]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A9DA6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAFAFC] border border-[#E7E8ED] rounded-xl text-xs text-[#292C33] placeholder-[#9A9DA6] focus:outline-none focus:border-[#625FEF] focus:bg-white transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 bg-[#625FEF] hover:bg-[#524FE0] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-[#F3F4F7] text-center">
            <p className="text-xs text-[#737782]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-medium text-[#625FEF] hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl px-6 py-5 text-center text-[11px] text-[#9A9DA6]">
        CyberGuard AI · Protected Threat Intelligence Platform
      </div>
    </div>
  );
};
