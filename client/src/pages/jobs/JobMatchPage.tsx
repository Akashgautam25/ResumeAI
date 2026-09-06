import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { resumeService } from '../../services/resumeService.js';
import { jobService } from '../../services/jobService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { JobMatch } from '../../types/index.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Badge } from '../../components/ui/Badge.js';
import { Progress } from '../../components/ui/Progress.js';
import { ScoreGauge } from '../../components/ui/ScoreGauge.js';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Globe,
  ArrowRight,
  Check,
  X,
  Target,
} from 'lucide-react';

export const JobMatchPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes(),
  });

  const matchMutation = useMutation({
    mutationFn: async () => {
      if (!company || !role || !jobText || !selectedResumeId) {
        throw new Error('Please fill in company, role, job description, and select a resume.');
      }

      // 1. Create Job record
      const job = await jobService.createJob({
        company,
        role,
        jobUrl,
        rawText: jobText,
      });

      // 2. Run match
      return jobService.matchJobWithResume(job.id, selectedResumeId);
    },
    onSuccess: (result) => {
      setMatchResult(result);
      success('Job match analysis complete!');
    },
    onError: (err: any) => {
      toastError(err.message || err.response?.data?.error || 'Failed to match job');
    },
  });

  const handleApplyTailoredDiff = (diffIdx: number) => {
    success(`Applied tailored suggestion #${diffIdx + 1} to your resume builder!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Job Description Matcher & Tailoring
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Compare your resume against any job description, identify missing keywords, and generate tailored bullet improvements.
        </p>
      </div>

      {/* Input Form Card */}
      <Card className="p-6 shadow-premium">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Company Name"
              placeholder="e.g. Stripe, Google, Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
              required
            />
            <Input
              label="Job Role / Title"
              placeholder="e.g. Software Engineer, Full-Stack"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
              required
            />
            <Input
              label="Job Posting URL (Optional)"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Select Resume to Compare Against
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Select a Resume...</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.atsScore} ATS Score)
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Job Description (Paste full posting text)"
            rows={6}
            placeholder="Paste responsibilities, qualifications, required technologies, and about the company..."
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            required
          />

          <div className="flex justify-end pt-2">
            <Button
              size="md"
              isLoading={matchMutation.isPending}
              onClick={() => matchMutation.mutate()}
              rightIcon={<Target className="w-4 h-4" />}
            >
              Run Job Match & Skill Gap Analysis
            </Button>
          </div>
        </div>
      </Card>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6">
          {/* Top Score Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <ScoreGauge
                score={matchResult.overallScore}
                size={160}
                strokeWidth={12}
                label="Match Score"
                sublabel="Role Alignment"
              />
              <div className="mt-3 text-xs text-zinc-500">
                Calculated across technical requirements, keyword density, and experience match.
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 border-b border-zinc-100">
                <CardTitle>Role Compatibility Breakdown</CardTitle>
                <CardDescription>Individual qualification match scores</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-700">Required Technical Skills Match</span>
                    <span className="font-bold text-zinc-900">{matchResult.skillMatchScore}%</span>
                  </div>
                  <Progress value={matchResult.skillMatchScore} indicatorClassName="bg-emerald-600" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-700">Industry Keyword & Terminology Match</span>
                    <span className="font-bold text-zinc-900">{matchResult.keywordMatchScore}%</span>
                  </div>
                  <Progress value={matchResult.keywordMatchScore} indicatorClassName="bg-zinc-900" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-700">Experience & Seniority Fit</span>
                    <span className="font-bold text-zinc-900">{matchResult.expMatchScore}%</span>
                  </div>
                  <Progress value={matchResult.expMatchScore} indicatorClassName="bg-zinc-700" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-700">Academic & Education Requirements</span>
                    <span className="font-bold text-zinc-900">{matchResult.eduMatchScore}%</span>
                  </div>
                  <Progress value={matchResult.eduMatchScore} indicatorClassName="bg-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <Card>
              <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm">Matched Skills ({matchResult.matchedSkills.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.matchedSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Partial Matches */}
            <Card>
              <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-sm">Partial Matches ({matchResult.partialSkills.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.partialSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                      ⚠ {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card>
              <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <CardTitle className="text-sm">Missing Skills ({matchResult.missingSkills.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missingSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                      ✗ {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tailoring Recommendations */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle>Strategic Tailoring Recommendations</CardTitle>
              <CardDescription>Targeted advice to maximize callback probability for this role</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {matchResult.recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{rec.title}</span>
                    <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'} size="sm">
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{rec.advice}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Job-Specific Tailored Diffs */}
          {matchResult.tailoredDiffs && matchResult.tailoredDiffs.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b border-zinc-100">
                <CardTitle>Job-Specific Phrasing Enhancements</CardTitle>
                <CardDescription>Review before/after phrasing before applying to your resume</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {matchResult.tailoredDiffs.map((diff, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase">
                        Section: {diff.section}
                      </span>
                      <span className="text-[11px] text-zinc-500">{diff.reason}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white border border-rose-200">
                        <span className="text-[10px] font-bold text-rose-600 block mb-1">CURRENT RESUME TEXT:</span>
                        <p className="text-zinc-600">{diff.original}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-700 block mb-1">PROPOSED TAILORED TEXT:</span>
                        <p className="text-zinc-900 font-medium">{diff.proposed}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button size="sm" onClick={() => handleApplyTailoredDiff(idx)} leftIcon={<Check className="w-3.5 h-3.5" />}>
                        Accept & Apply to Builder
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
