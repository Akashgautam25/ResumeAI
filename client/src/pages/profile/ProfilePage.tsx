import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { authService } from '../../services/authService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { User, Mail, Briefcase, Globe, Linkedin, Github, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full-Stack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Entry-Level / Student');
  const [preferredIndustry, setPreferredIndustry] = useState(user?.preferredIndustry || 'Technology');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [github, setGithub] = useState(user?.github || '');
  const [portfolio, setPortfolio] = useState(user?.portfolio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await authService.updateProfile({
        name,
        targetRole,
        experienceLevel,
        preferredIndustry,
        linkedin,
        github,
        portfolio,
      });
      setUser(updated);
      success('Profile updated successfully!');
    } catch {
      toastError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">User Profile</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage your default career targets and professional profile links</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Basic account and contact details</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
                helperText="Email cannot be changed directly."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Engineering Role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
              />
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="Entry-Level / Student">Entry-Level / 3rd-Year CS Student</option>
                  <option value="Junior Software Engineer (1-2 yrs)">Junior Software Engineer (1-2 yrs)</option>
                  <option value="Mid-Level Software Engineer (3-5 yrs)">Mid-Level Software Engineer (3-5 yrs)</option>
                  <option value="Senior Software Engineer (5+ yrs)">Senior Software Engineer (5+ yrs)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle>Professional Profiles</CardTitle>
            <CardDescription>Social and portfolio links used to auto-populate new resumes</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              leftIcon={<Linkedin className="w-4 h-4" />}
            />
            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              leftIcon={<Github className="w-4 h-4" />}
            />
            <Input
              label="Portfolio / Personal Website"
              placeholder="https://portfolio.dev"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
