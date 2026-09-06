import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { resumeService } from '../services/resumeService.js';
import { jobService } from '../services/jobService.js';
import { interviewService } from '../services/interviewService.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { ScoreGauge } from '../components/ui/ScoreGauge.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import {
  FileText,
  Upload,
  Briefcase,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Eye,
  Edit3,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getJobs(),
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => interviewService.getSessions(),
  });

  const totalResumes = resumes.length;
  const avgAtsScore = totalResumes > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / totalResumes)
    : 0;
  const totalJobMatches = jobs.reduce((acc, j) => acc + (j.matches?.length || (j.latestMatch ? 1 : 0)), 0);
  const totalInterviews = interviews.length;

  const primaryResume = resumes[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Welcome back, {user?.name?.split(' ')[0] || 'Engineer'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Targeting: <strong className="text-zinc-800 font-semibold">{user?.targetRole || 'Software Engineer'}</strong> • {user?.experienceLevel || 'Entry-Level'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/resumes/upload">
            <Button size="sm" variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
              Upload Resume
            </Button>
          </Link>
          <Link to="/job-match">
            <Button size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
              Match Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Resumes</span>
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-950">{resumesLoading ? '-' : totalResumes}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Active resume versions</div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Average ATS Score</span>
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-950">
            {resumesLoading ? '-' : `${avgAtsScore}/100`}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            {avgAtsScore >= 80 ? '✓ Top tier competitiveness' : 'Optimization suggested'}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Job Matches</span>
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-950">{totalJobMatches}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Tailored comparisons</div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Interview Sessions</span>
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-zinc-950">{totalInterviews}</div>
          <div className="mt-1 text-[11px] text-zinc-500">STAR questions practiced</div>
        </Card>
      </div>

      {/* Main Row: Active Resume Spotlight & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Resume Spotlight */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Master Resume</CardTitle>
                  <CardDescription>Primary profile used for AI analysis and job tailoring</CardDescription>
                </div>
                {primaryResume && (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white text-[11px] font-semibold">
                    Primary
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="py-6">
              {resumesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-3/4" />
                </div>
              ) : primaryResume ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-left w-full sm:w-auto">
                    <h3 className="text-lg font-bold text-zinc-950">{primaryResume.title}</h3>
                    <p className="text-xs text-zinc-500">
                      Target Role: <span className="font-semibold text-zinc-800">{primaryResume.targetRole || 'Software Engineer'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Updated {new Date(primaryResume.updatedAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Template: <strong className="capitalize">{primaryResume.templateId}</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3">
                      <Link to={`/resumes/${primaryResume.id}/analysis`}>
                        <Button size="sm" leftIcon={<BarChart3 className="w-3.5 h-3.5" />}>
                          View ATS Analysis
                        </Button>
                      </Link>
                      <Link to={`/resumes/${primaryResume.id}/editor`}>
                        <Button size="sm" variant="outline" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                          Edit in Builder
                        </Button>
                      </Link>
                      <Link to={`/resumes/${primaryResume.id}`}>
                        <Button size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          Live Preview
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <ScoreGauge score={primaryResume.atsScore || 85} size={130} />
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Upload className="w-6 h-6" />}
                  title="No Resumes Uploaded Yet"
                  description="Upload your existing PDF/DOCX resume to receive deterministic ATS scoring and AI suggestions."
                  actionLabel="Upload Your Resume"
                  onAction={() => navigate('/resumes/upload')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Card */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-zinc-100">
              <CardTitle>Quick Workflows</CardTitle>
              <CardDescription>Accelerate your job application steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              <Link
                to="/resumes/upload"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 transition-all text-xs font-semibold text-zinc-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-800 shadow-sm">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div>Upload & Parse Resume</div>
                    <div className="text-[11px] font-normal text-zinc-500">PDF or DOCX document</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/job-match"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 transition-all text-xs font-semibold text-zinc-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-800 shadow-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div>Match Job Description</div>
                    <div className="text-[11px] font-normal text-zinc-500">Identify missing skills & keywords</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/interview-prep"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 transition-all text-xs font-semibold text-zinc-900 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-800 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div>AI Interview Questions</div>
                    <div className="text-[11px] font-normal text-zinc-500">Tailored to your projects & tech</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumes Overview & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Resumes Table / Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <CardTitle>My Resumes</CardTitle>
              <CardDescription>Manage multiple versions and tailored resumes</CardDescription>
            </div>
            <Link to="/resumes">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {resumes.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No resumes found</p>
            ) : (
              resumes.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-800">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900">{r.title}</div>
                      <div className="text-[11px] text-zinc-500">{r.targetRole || 'Software Engineer'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-900">{r.atsScore}/100</span>
                    <Link to={`/resumes/${r.id}/analysis`}>
                      <Button size="sm" variant="outline">Analyze</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Job Matches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <CardTitle>Target Job Matches</CardTitle>
              <CardDescription>Tailored comparisons against open positions</CardDescription>
            </div>
            <Link to="/job-match">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                New Match
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {jobs.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No job descriptions added yet</p>
            ) : (
              jobs.slice(0, 3).map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50/40 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-900">{j.role}</div>
                    <div className="text-[11px] text-zinc-500">{j.company}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {j.latestMatch && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        {j.latestMatch.overallScore}% Match
                      </span>
                    )}
                    <Link to={`/jobs/${j.id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
