import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../services/resumeService.js';
import { analysisService } from '../services/analysisService.js';
import { useToast } from '../contexts/ToastContext.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { ScoreGauge } from '../components/ui/ScoreGauge.js';
import { Progress } from '../components/ui/Progress.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import {
  BarChart3,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Target,
  FileText,
  Eye,
} from 'lucide-react';
import { Resume } from '../types/index.js';

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  if (score >= 85) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <TrendingUp className="w-3 h-3" /> Strong
    </span>
  );
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
      <Minus className="w-3 h-3" /> Competitive
    </span>
  );
  if (score >= 50) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle className="w-3 h-3" /> Needs Work
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle className="w-3 h-3" /> Critical
    </span>
  );
};

const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const color =
    score >= 85 ? 'bg-emerald-600' : score >= 70 ? 'bg-zinc-900' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-zinc-600">{label}</span>
        <span className="font-bold text-zinc-900">{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export const ATSScoringPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes(),
  });

  const analyzeMutation = useMutation({
    mutationFn: (resumeId: string) => analysisService.analyzeResume(resumeId),
    onSuccess: (_, resumeId) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['analysis', resumeId] });
      success('ATS analysis complete!');
      navigate(`/resumes/${resumeId}/analysis`);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Analysis failed. Please try again.');
    },
  });

  const totalResumes = resumes.length;
  const avgScore =
    totalResumes > 0 ? Math.round(resumes.reduce((a, r) => a + (r.atsScore || 0), 0) / totalResumes) : 0;
  const strongCount = resumes.filter((r) => (r.atsScore || 0) >= 85).length;
  const needsWorkCount = resumes.filter((r) => (r.atsScore || 0) < 70).length;

  const selectedResume = resumes.find((r) => r.id === selectedId) ?? resumes[0] ?? null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">ATS Scoring</h1>
            <Badge variant="outline">Live Analysis</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Measure your resume performance across 10 ATS criteria. Score ≥ 85 is competitive for top companies.
          </p>
        </div>
        <Link to="/resumes/upload">
          <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}>
            Upload Resume
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Resumes',
            value: isLoading ? '–' : totalResumes,
            icon: <FileText className="w-4 h-4" />,
            sub: 'in your library',
          },
          {
            label: 'Avg ATS Score',
            value: isLoading ? '–' : `${avgScore}/100`,
            icon: <BarChart3 className="w-4 h-4" />,
            sub: avgScore >= 80 ? '✓ Top-tier range' : 'Optimization recommended',
            subColor: avgScore >= 80 ? 'text-emerald-600' : 'text-amber-600',
          },
          {
            label: 'ATS Ready',
            value: isLoading ? '–' : strongCount,
            icon: <CheckCircle2 className="w-4 h-4" />,
            sub: 'Score ≥ 85',
            subColor: 'text-emerald-600',
          },
          {
            label: 'Need Attention',
            value: isLoading ? '–' : needsWorkCount,
            icon: <AlertTriangle className="w-4 h-4" />,
            sub: 'Score < 70',
            subColor: 'text-amber-600',
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">{s.label}</span>
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">{s.icon}</div>
            </div>
            <div className="mt-3 text-2xl font-bold text-zinc-950">{s.value}</div>
            <div className={`mt-1 text-[11px] font-medium ${s.subColor ?? 'text-zinc-500'}`}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="lg:col-span-2 h-80 rounded-2xl" />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-6 h-6" />}
          title="No Resumes to Score Yet"
          description="Upload a PDF or DOCX resume to get your ATS score and detailed breakdown."
          actionLabel="Upload Your First Resume"
          onAction={() => navigate('/resumes/upload')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Picker List */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1 pb-1">
              Your Resumes
            </p>
            {resumes.map((r) => {
              const isActive = (selectedId ? selectedId === r.id : resumes[0]?.id === r.id);
              const scoreColor =
                (r.atsScore || 0) >= 85
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : (r.atsScore || 0) >= 70
                  ? 'text-zinc-700 bg-zinc-100 border-zinc-200'
                  : (r.atsScore || 0) >= 50
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200';
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'border-zinc-900 bg-zinc-900 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                        <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                          {r.title}
                        </div>
                        <div className={`text-[11px] truncate ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {r.targetRole || 'General'}
                        </div>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                      isActive ? 'bg-zinc-700 text-white border-zinc-600' : scoreColor
                    }`}>
                      {r.atsScore}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Score Detail Panel */}
          {selectedResume && (
            <div className="lg:col-span-2 space-y-5">
              {/* Score overview card */}
              <Card>
                <CardHeader className="pb-4 border-b border-zinc-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle>{selectedResume.title}</CardTitle>
                      <CardDescription>
                        Target: {selectedResume.targetRole || 'General'} •{' '}
                        Updated {new Date(selectedResume.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={analyzeMutation.isPending}
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        onClick={() => analyzeMutation.mutate(selectedResume.id)}
                      >
                        {selectedResume.atsScore ? 'Re-Analyze' : 'Analyze Now'}
                      </Button>
                      {selectedResume.atsScore > 0 && (
                        <Link to={`/resumes/${selectedResume.id}/analysis`}>
                          <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            Full Report
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-5">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                    {/* Gauge */}
                    <div className="flex-shrink-0">
                      <ScoreGauge
                        score={selectedResume.atsScore || 0}
                        size={150}
                        strokeWidth={11}
                        label="ATS Score"
                        showStatus
                      />
                    </div>

                    {/* Mini stat grid */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {[
                        {
                          label: 'Completeness',
                          value: `${selectedResume.completenessScore ?? 0}%`,
                          icon: <Target className="w-3.5 h-3.5" />,
                        },
                        {
                          label: 'ATS Score',
                          value: `${selectedResume.atsScore ?? 0}/100`,
                          icon: <Zap className="w-3.5 h-3.5" />,
                        },
                        {
                          label: 'Template',
                          value: selectedResume.templateId?.replace('-', ' ') ?? 'Classic',
                          icon: <FileText className="w-3.5 h-3.5" />,
                        },
                        {
                          label: 'Status',
                          value: selectedResume.isBase ? 'Base Resume' : 'Tailored',
                          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                        },
                      ].map((s) => (
                        <div key={s.label} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                          <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            {s.icon}
                            <span className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</span>
                          </div>
                          <div className="text-sm font-bold text-zinc-900 capitalize">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category breakdown if analysis exists */}
              {selectedResume.latestAnalysis && (
                <Card>
                  <CardHeader className="pb-3 border-b border-zinc-100">
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>10-dimension ATS scoring model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      { label: 'ATS Compatibility', score: selectedResume.latestAnalysis.categoryScores.atsCompatibility },
                      { label: 'Resume Structure', score: selectedResume.latestAnalysis.categoryScores.resumeStructure },
                      { label: 'Skills Density', score: selectedResume.latestAnalysis.categoryScores.skills },
                      { label: 'Experience Depth', score: selectedResume.latestAnalysis.categoryScores.experience },
                      { label: 'Project Quality', score: selectedResume.latestAnalysis.categoryScores.projects },
                      { label: 'Education Alignment', score: selectedResume.latestAnalysis.categoryScores.education },
                      { label: 'Achievements', score: selectedResume.latestAnalysis.categoryScores.achievements },
                      { label: 'Keyword Optimization', score: selectedResume.latestAnalysis.categoryScores.keywords },
                      { label: 'Measurable Impact', score: selectedResume.latestAnalysis.categoryScores.impact },
                      { label: 'Formatting', score: selectedResume.latestAnalysis.categoryScores.formatting },
                    ].map((c) => (
                      <ScoreBar key={c.label} label={c.label} score={c.score} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* No analysis yet state */}
              {!selectedResume.latestAnalysis && selectedResume.atsScore === 0 && (
                <Card className="border-dashed border-zinc-300">
                  <CardContent className="py-10 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 mb-3">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-1">No Analysis Yet</h3>
                    <p className="text-xs text-zinc-500 mb-4 max-w-xs mx-auto">
                      Run an AI-powered ATS analysis to get a detailed score breakdown, keyword coverage, and actionable improvements.
                    </p>
                    <Button
                      size="sm"
                      isLoading={analyzeMutation.isPending}
                      leftIcon={<Zap className="w-3.5 h-3.5" />}
                      onClick={() => analyzeMutation.mutate(selectedResume.id)}
                    >
                      Run ATS Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Action links */}
              <div className="flex flex-wrap gap-2">
                <Link to={`/resumes/${selectedResume.id}/editor`}>
                  <Button size="sm" variant="outline">Edit in Builder</Button>
                </Link>
                <Link to={`/resumes/${selectedResume.id}`}>
                  <Button size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    Preview Resume
                  </Button>
                </Link>
                <Link to="/job-match">
                  <Button size="sm" variant="ghost">Match with Job →</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Resumes Table */}
      {resumes.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle>All Resume Scores</CardTitle>
            <CardDescription>Quick overview ranked by ATS performance</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Resume', 'Target Role', 'ATS Score', 'Completeness', 'Status', ''].map((h) => (
                      <th key={h} className="text-left pb-3 pr-4 font-semibold text-zinc-500 uppercase tracking-wide text-[10px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {[...resumes]
                    .sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0))
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3 pr-4 font-bold text-zinc-900">{r.title}</td>
                        <td className="py-3 pr-4 text-zinc-500">{r.targetRole || '—'}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-zinc-900 w-8 text-right">{r.atsScore}</span>
                            <div className="w-20 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  (r.atsScore || 0) >= 85 ? 'bg-emerald-600' :
                                  (r.atsScore || 0) >= 70 ? 'bg-zinc-900' :
                                  (r.atsScore || 0) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${r.atsScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-zinc-600">{r.completenessScore ?? 0}%</td>
                        <td className="py-3 pr-4"><ScoreBadge score={r.atsScore || 0} /></td>
                        <td className="py-3">
                          <Link to={`/resumes/${r.id}/analysis`}>
                            <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3 h-3" />}>
                              Report
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
