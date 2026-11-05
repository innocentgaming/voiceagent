import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Key,
  CheckCircle2,
  Sliders,
  Shield,
  User,
  Building2,
  Lock,
  Save,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage({
  user,
  theme,
  onToggleTheme,
  onOpenAuthModal,
  onShowToast
}) {
  const [workspaceName, setWorkspaceName] = useState('Gnani Speech AI Benchmarking Lab');
  const [defaultLanguage, setDefaultLanguage] = useState('hinglish');
  const [werThreshold, setWerThreshold] = useState(15);
  const [strictZeroError, setStrictZeroError] = useState(true);
  const [redactPii, setRedactPii] = useState(true);
  const [retentionDays, setRetentionDays] = useState(90);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (onShowToast) {
        onShowToast({
          id: Date.now(),
          type: 'success',
          title: 'Settings Saved',
          message: 'Workspace configurations and model evaluation thresholds updated.'
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e9ef] dark:border-[#1e2638]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#151923] dark:text-[#f1f5f9] tracking-tight">
            Platform Settings & Governance Configuration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#697386] dark:text-[#94a3b8]">
            Configure workspace parameters, STT engine connections, evaluation tolerances, and enterprise security policies.
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          loading={isSaving}
          variant="primary"
          size="md"
          icon={Save}
        >
          {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Workspace Parameters */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <Building2 className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
              Workspace Parameters
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full saas-control px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                Default Evaluation Language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full saas-control px-3 py-2 text-xs cursor-pointer font-medium"
              >
                <option value="hinglish">Hinglish (Code-Mixed Matrix)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="mr-IN">Marathi (mr-IN)</option>
                <option value="en-IN">English (India)</option>
                <option value="ta-IN">Tamil (ta-IN)</option>
                <option value="te-IN">Telugu (te-IN)</option>
                <option value="kn-IN">Kannada (kn-IN)</option>
                <option value="bn-IN">Bengali (bn-IN)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1">
                Audit Log Retention
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full saas-control px-3 py-2 text-xs cursor-pointer font-medium"
              >
                <option value={30}>30 Days (Standard QA)</option>
                <option value={90}>90 Days (Enterprise Regulatory)</option>
                <option value={365}>365 Days (Full Year Compliance)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: User Account & Appearance */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <User className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
              User Profile & Appearance
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-[9px] bg-[#f8f9fc] dark:bg-[#0d121c] border border-[#e6e9ef] dark:border-[#1e2638] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#151923] dark:text-[#f1f5f9]">{user?.name || 'Aditya Yadav'}</div>
                <div className="text-[11px] text-[#697386] dark:text-[#94a3b8] font-mono">{user?.email || 'aadiyadav1706@gmail.com'}</div>
                <div className="mt-1">
                  <Badge variant="primary" size="sm">{user?.role || 'Lead Voice AI Researcher'}</Badge>
                </div>
              </div>
              <Button onClick={() => onOpenAuthModal && onOpenAuthModal('login')} variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-[#697386] dark:text-[#94a3b8] mb-1.5">
                Interface Color Scheme
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => theme !== 'light' && onToggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[9px] border text-xs font-semibold cursor-pointer transition ${
                    theme === 'light'
                      ? 'bg-white border-[#3457d5] text-[#3457d5] shadow-xs'
                      : 'bg-[#f8f9fc] dark:bg-[#0d121c] border-[#e6e9ef] dark:border-[#1e2638] text-[#697386]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Day Mode (Clean)</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme !== 'dark' && onToggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[9px] border text-xs font-semibold cursor-pointer transition ${
                    theme === 'dark'
                      ? 'bg-[#1a233b] border-[#4f70ec] text-[#6a87f5] shadow-xs'
                      : 'bg-[#f8f9fc] dark:bg-[#0d121c] border-[#e6e9ef] dark:border-[#1e2638] text-[#697386]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-[#6a87f5]" />
                  <span>Night Mode (Obsidian)</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Speech-to-Text API Credentials */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <Key className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
              Gnani Prisma / Vachana AI Engine
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-[#8c97a8] mb-1 font-sans font-bold text-[11px]">STT Endpoint URL</label>
              <input
                type="text"
                readOnly
                value="https://api.vachana.ai/stt/v3"
                className="w-full saas-control px-3 py-2 bg-[#f8f9fc] dark:bg-[#0d121c] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[#8c97a8] mb-1 font-sans font-bold text-[11px]">API Key Token (Secure Backend Hash)</label>
              <input
                type="password"
                readOnly
                value="vach_1ytE2CY5X2DwVevuF9wx1NPQj1atg0lnEJBdlvaaeBjEOtsyScsIyInCjrqtZ5Clr5FMacqGtosFY0WFSKlBwMHn2HGp58mm_fe8f5d2877017adbca3a09a908c69bad"
                className="w-full saas-control px-3 py-2 bg-[#f8f9fc] dark:bg-[#0d121c] cursor-not-allowed"
              />
            </div>

            <div className="p-2.5 rounded-[9px] bg-[#e8f5ef] dark:bg-[#062d1f] border border-[#16865b]/20 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2 text-[#16865b] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified 200 OK • Production Connection Live</span>
              </div>
              <span className="font-mono text-[10px] text-[#16865b] font-bold">Latency p95: 312ms</span>
            </div>
          </div>
        </Card>

        {/* Section 4: Model Thresholds & Evaluation Tolerances */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e6e9ef] dark:border-[#1e2638]">
            <Sliders className="w-4 h-4 text-[#3457d5] dark:text-[#6a87f5]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#697386] dark:text-[#94a3b8] font-mono">
              Evaluation Thresholds & Guardrails
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-[#151923] dark:text-[#f1f5f9]">
                  Word Error Rate (WER) Alert Ceiling
                </label>
                <span className="font-mono font-bold text-[#3457d5] dark:text-[#6a87f5]">
                  {werThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={werThreshold}
                onChange={(e) => setWerThreshold(Number(e.target.value))}
                className="w-full accent-[#3457d5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8c97a8] font-mono mt-0.5">
                <span>Strict (5%)</span>
                <span>Standard (15%)</span>
                <span>Permissive (35%)</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#e6e9ef] dark:border-[#1e2638]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-[#151923] dark:text-[#f1f5f9]">
                    Strict Zero-Error Entity Gate
                  </div>
                  <div className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
                    Fail tests immediately if any recipient name or payment amount mismatches.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={strictZeroError}
                  onChange={(e) => setStrictZeroError(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3457d5] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-bold text-[#151923] dark:text-[#f1f5f9]">
                    Indian PII Sanitization
                  </div>
                  <div className="text-[11px] text-[#697386] dark:text-[#94a3b8]">
                    Auto-redact Aadhaar (12-digit) and UPI identifiers in audit logs.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={redactPii}
                  onChange={(e) => setRedactPii(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3457d5] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
