import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../services/jobService.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { ScoreGauge } from '../../components/ui/ScoreGauge.js';
import { ArrowLeft, Building2, Globe, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-zinc-900">Job Description Not Found</h2>
        <Link to="/job-match" className="mt-4 inline-block">
          <Button size="sm">Back to Job Matcher</Button>
        </Link>
      </div>
    );
  }

  const latestMatch = job.matches?.[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <Link to="/job-match" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Matcher
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{job.role}</h1>
          <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
            <Building2 className="w-3.5 h-3.5" /> {job.company}
            {job.jobUrl && (
              <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-zinc-700 hover:underline flex items-center gap-1 ml-2">
                <Globe className="w-3.5 h-3.5" /> View Posting
              </a>
            )}
          </p>
        </div>
      </div>

      {latestMatch && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div>
              <span className="text-xs font-semibold text-zinc-500">Latest Resume Match</span>
              <h3 className="text-lg font-bold text-zinc-950">{latestMatch.resumeTitle}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Matched on {new Date(latestMatch.createdAt).toLocaleDateString()}</p>
            </div>
            <ScoreGauge score={latestMatch.overallScore} size={120} label="Match" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
            <div>
              <span className="font-bold text-emerald-800 block mb-2">Matched Skills:</span>
              <div className="flex flex-wrap gap-1">
                {latestMatch.matchedSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-amber-800 block mb-2">Partial Matches:</span>
              <div className="flex flex-wrap gap-1">
                {latestMatch.partialSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                    ⚠ {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-rose-800 block mb-2">Missing Skills:</span>
              <div className="flex flex-wrap gap-1">
                {latestMatch.missingSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Raw Description Text */}
      <Card>
        <CardHeader className="pb-2 border-b border-zinc-100">
          <CardTitle>Job Description Text</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed">
            {job.rawText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
