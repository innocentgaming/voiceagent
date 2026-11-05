import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Lead Voice AI Researcher');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = mode === 'signup'
        ? { name, email, password, role }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('indic_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('indic_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Network error connecting to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="saas-card relative w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e9ef] dark:border-[#1e2638]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#ebf0ff] dark:bg-[#1a233b] text-[#3457d5] dark:text-[#6a87f5] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#151923] dark:text-[#f1f5f9]">
                {mode === 'signup' ? 'Create Enterprise Account' : 'Sign in to IndicVoice Lab'}
              </h2>
              <p className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
                Voice AI Testing and Evaluation Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[7px] text-[#8c97a8] hover:text-[#151923] dark:hover:text-[#f1f5f9] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex p-1 rounded-[9px] bg-[#f2f4f8] dark:bg-[#1a2234] border border-[#e6e9ef] dark:border-[#1e2638] text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 rounded-[7px] transition cursor-pointer text-center ${
              mode === 'login'
                ? 'bg-white dark:bg-[#111622] text-[#3457d5] dark:text-[#6a87f5] shadow-xs'
                : 'text-[#697386] dark:text-[#94a3b8]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-1.5 rounded-[7px] transition cursor-pointer text-center ${
              mode === 'signup'
                ? 'bg-white dark:bg-[#111622] text-[#3457d5] dark:text-[#6a87f5] shadow-xs'
                : 'text-[#697386] dark:text-[#94a3b8]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 rounded-[9px] bg-[#fdeeee] dark:bg-[#341111]/40 border border-[#d64545]/20 text-[#d64545] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
                Full Name <span className="text-[#d64545]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Yadav"
                  className="w-full pl-9 pr-3 py-2 saas-control text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
              Work Email <span className="text-[#d64545]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aadiyadav1706@gmail.com"
                className="w-full pl-9 pr-3 py-2 saas-control text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
              Password <span className="text-[#d64545]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 saas-control text-xs font-mono"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-[#151923] dark:text-[#f1f5f9] mb-1">
                Platform Role & Access Tier
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#8c97a8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 saas-control text-xs cursor-pointer font-medium"
                >
                  <option value="Lead Voice AI Researcher">Lead Voice AI Researcher (Admin)</option>
                  <option value="Speech QA Engineer">Speech QA Engineer</option>
                  <option value="ML Research Scientist">ML Research Scientist</option>
                  <option value="Executive Reviewer">Executive Reviewer (Viewer)</option>
                </select>
              </div>
            </div>
          )}

          {/* Quick Credential Pre-fill helper */}
          {mode === 'login' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('aadiyadav1706@gmail.com');
                  setPassword('indicvoice2026');
                }}
                className="text-[11px] font-semibold text-[#3457d5] dark:text-[#6a87f5] hover:underline cursor-pointer"
              >
                Pre-fill default login: Aditya Yadav (Lead AI Researcher)
              </button>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              className="w-full justify-center"
              icon={ArrowRight}
              iconPosition="right"
            >
              {mode === 'signup' ? 'Create Enterprise Account' : 'Sign In to Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
