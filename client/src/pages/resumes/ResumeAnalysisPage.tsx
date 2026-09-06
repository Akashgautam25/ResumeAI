import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../../services/resumeService.js';
import { analysisService } from '../../services/analysisService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ScoreGauge } from '../../components/ui/ScoreGauge.js';
import { Progress } from '../../components/ui/Progress.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Sparkles,
  Edit3,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Eye,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
} from 'lucide-react';

export const ResumeAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data: resume, isLoading: resumeLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeService.getResumeById(id!),
    enabled: !!id,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisService.getAnalysis(id!),
    enabled: !!id,
  });

  const reanalyzeMutation = useMutation({
    mutationFn: () => analysisService.analyzeResume(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', id] });
      queryClient.invalidateQueries({ queryKey: ['resume', id] });
      success('Resume re-analyzed successfully!');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Failed to re-analyze resume');
    },
  });

  if (resumeLoading || analysisLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 md:col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!resume || !analysis) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-zinc-900">Analysis Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">Please try re-analyzing or return to your resumes list.</p>
        <Link to="/resumes" className="mt-4 inline-block">
          <Button size="sm">Back to Resumes</Button>
        </Link>
      </div>
    );
  }

  const { categoryScores, strengths = [], weaknesses = [], improvements = [], keywordAnalysis, deterministicMetrics } = analysis;

  const categories = [
    { name: 'ATS Compatibility', score: categoryScores?.atsCompatibility ?? 90 },
    { name: 'Resume Structure', score: categoryScores?.resumeStructure ?? 85 },
    { name: 'Skills Density', score: categoryScores?.skills ?? 88 },
    { name: 'Experience Depth', score: categoryScores?.experience ?? 82 },
    { name: 'Project Quality', score: categoryScores?.projects ?? 85 },
    { name: 'Education Alignment', score: categoryScores?.education ?? 92 },
    { name: 'Achievements & Honors', score: categoryScores?.achievements ?? 80 },
    { name: 'Keyword Optimization', score: categoryScores?.keywords ?? 86 },
    { name: 'Measurable Impact', score: categoryScores?.impact ?? 78 },
    { name: 'Formatting Consistency', score: categoryScores?.formatting ?? 92 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{resume.title}</h1>
            <Badge variant="outline">ATS Audit Report</Badge>
          </div>
          <p className="text-xs text-zinc-500">
            Target Role: <strong className="text-zinc-800 font-semibold">{resume.targetRole || 'Software Engineer'}</strong> • Analyzed {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            isLoading={reanalyzeMutation.isPending}
            onClick={() => reanalyzeMutation.mutate()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-Analyze
          </Button>
          <Link to={`/resumes/${resume.id}/editor`}>
            <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
              Open in Builder
            </Button>
          </Link>
          <Link to={`/job-match`}>
            <Button size="sm" leftIcon={<Briefcase className="w-3.5 h-3.5" />}>
              Match with Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Score & Metrics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <ScoreGauge score={analysis.atsScore} size={160} strokeWidth={12} label="ATS Score" />
          <div className="mt-4 text-xs text-zinc-500 max-w-xs leading-relaxed">
            Composite score calculated from 15+ deterministic layout rules and qualitative AI feedback.
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 w-full grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-500 text-[10px]">Action Verbs</span>
              <div className="font-bold text-zinc-900 mt-0.5">{analysis.keywordAnalysis?.actionVerbsCount || deterministicMetrics?.actionVerbsCount || 0} verbs</div>
            </div>
            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <span className="text-zinc-500 text-[10px]">Quantified Bullets</span>
              <div className="font-bold text-zinc-900 mt-0.5">{analysis.keywordAnalysis?.measurableMetricsCount || deterministicMetrics?.measurableMetricsCount || 0} metrics</div>
            </div>
          </div>
        </Card>

        {/* 10 Category Breakdown Bars */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle>ATS Category Breakdown</CardTitle>
            <CardDescription>Individual component scores out of 100</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-700">{cat.name}</span>
                  <span className="font-bold text-zinc-900">{cat.score}%</span>
                </div>
                <Progress
                  value={cat.score}
                  size="sm"
                  indicatorClassName={
                    cat.score >= 85
                      ? 'bg-emerald-600'
                      : cat.score >= 70
                      ? 'bg-zinc-900'
                      : 'bg-amber-500'
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <CardTitle>Identified Strengths</CardTitle>
              <CardDescription>What your resume is doing exceptionally well</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {strengths.length === 0 ? (
              <p className="text-xs text-zinc-500">No specific strengths flagged yet.</p>
            ) : (
              strengths.map((str, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">{str.title}</span>
                    <Badge variant="secondary" size="sm">{str.category}</Badge>
                  </div>
                  <p className="text-xs text-zinc-700 mt-1 leading-relaxed">{str.explanation}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Categorized Weaknesses */}
        <Card>
          <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <CardTitle>Shortcomings & Fixes</CardTitle>
              <CardDescription>Ranked by severity for maximum score impact</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {weaknesses.length === 0 ? (
              <p className="text-xs text-zinc-500">No critical weaknesses detected! Resume is ATS optimized.</p>
            ) : (
              weaknesses.map((weak, idx) => {
                const severityStyles = {
                  Critical: 'bg-rose-50/60 border-rose-200 text-rose-900',
                  High: 'bg-amber-50/60 border-amber-200 text-amber-900',
                  Medium: 'bg-zinc-50 border-zinc-200 text-zinc-900',
                  Low: 'bg-zinc-50 border-zinc-200 text-zinc-900',
                };

                return (
                  <div key={idx} className={`p-3 rounded-xl border ${severityStyles[weak.severity]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{weak.title}</span>
                      <Badge
                        variant={
                          weak.severity === 'Critical'
                            ? 'destructive'
                            : weak.severity === 'High'
                            ? 'warning'
                            : 'secondary'
                        }
                        size="sm"
                      >
                        {weak.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-700 mt-1 leading-relaxed">{weak.explanation}</p>
                    {weak.recommendation && (
                      <div className="mt-2 text-[11px] text-zinc-800 font-medium bg-white/70 p-2 rounded-lg border border-zinc-200/50">
                        💡 <strong className="font-semibold">Action:</strong> {weak.recommendation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keywords Analysis Card */}
      {keywordAnalysis && (
        <Card>
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle>Industry Keywords & Competency Coverage</CardTitle>
            <CardDescription>Matching your resume terms against technical recruiter indexes</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-700 block mb-2">Detected Tech Stack & Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {keywordAnalysis.topKeywords?.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {keywordAnalysis.missingKeywords && keywordAnalysis.missingKeywords.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-zinc-700 block mb-2">Recommended Industry Keywords to Add:</span>
                <div className="flex flex-wrap gap-1.5">
                  {keywordAnalysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Improvement Proposals */}
      {improvements.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle>AI Section Improvement Suggestions</CardTitle>
              <CardDescription>Actionable wording upgrades strictly preserving your actual experience</CardDescription>
            </div>
            <Link to={`/resumes/${resume.id}/editor`}>
              <Button size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Apply in Builder
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {improvements.map((imp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                    Section: {imp.section}
                  </span>
                  <span className="text-[11px] text-zinc-500">{imp.reason}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 block mb-1">ORIGINAL PHRASING:</span>
                    <p className="text-zinc-600">{imp.originalText}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 block mb-1">RECOMMENDED IMPROVEMENT:</span>
                    <p className="text-zinc-900 font-medium">{imp.suggestedText}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
