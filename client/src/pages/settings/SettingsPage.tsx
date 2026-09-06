import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Settings, Lock, Sparkles, Key, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Custom AI API Key state (stored in local client state for user convenience)
  const [aiProvider, setAiProvider] = useState('groq');
  const [customKey, setCustomKey] = useState(localStorage.getItem('resumeai_custom_key') || '');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toastError('Password must be at least 8 characters');
      return;
    }

    try {
      setChangingPass(true);
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password changed successfully!');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKey) {
      localStorage.setItem('resumeai_custom_key', customKey);
    } else {
      localStorage.removeItem('resumeai_custom_key');
    }
    success('AI configuration preferences updated!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Settings & Security</h1>
        <p className="text-xs text-zinc-500 mt-1">Configure AI engine parameters, security, and account preferences</p>
      </div>

      {/* AI Provider Config */}
      <Card className="p-6">
        <CardHeader className="pb-4 border-b border-zinc-100 flex flex-row items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div>
            <CardTitle>AI Engine & Model Preferences</CardTitle>
            <CardDescription>Configure the backend LLM provider used for ATS scoring and tailoring</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSaveAiConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Active AI Provider
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="groq">Groq (Llama 3.3 70B Versatile — Ultra Fast)</option>
                  <option value="openai">OpenAI (GPT-4o Mini)</option>
                  <option value="mock">Offline Heuristic Engine (Deterministic Safe Fallback)</option>
                </select>
              </div>

              <Input
                label="Custom API Key (Optional Override)"
                type="password"
                placeholder="gsk_... or sk-..."
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                leftIcon={<Key className="w-4 h-4" />}
                helperText="Leave blank to use server environment defaults."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm">
                Save AI Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="p-6">
        <CardHeader className="pb-4 border-b border-zinc-100 flex flex-row items-center gap-2">
          <Lock className="w-5 h-5 text-zinc-800" />
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account login password</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password (min 8 characters)"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" size="sm" isLoading={changingPass}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-rose-200 bg-rose-50/20">
        <CardHeader className="pb-3 border-b border-rose-100 flex flex-row items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <div>
            <CardTitle className="text-rose-900">Danger Zone</CardTitle>
            <CardDescription className="text-rose-700">Irreversible account operations</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-900 block">Delete Account & Data</span>
            <span className="text-[11px] text-zinc-500">Permanently delete all uploaded resumes, versions, and analysis history.</span>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                toastError('Account deletion requested. Please contact support.');
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
