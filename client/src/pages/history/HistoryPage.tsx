import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analysisService } from '../../services/analysisService.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { History, BarChart3, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['analysis-history'],
    queryFn: () => analysisService.getHistory(),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Analysis Audit History</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Historical log of ATS evaluations, score progression, and past resume iterations
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <Card className="p-12 text-center text-xs text-zinc-500">
          <History className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-800">No Historical Analyses Found</h3>
          <p className="mt-1">Upload a resume or edit in builder to generate new audit logs.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white shadow-subtle hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 font-bold text-xs text-zinc-900 border border-zinc-200">
                  <BarChart3 className="w-5 h-5 text-zinc-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">{h.resumeTitle || 'Resume'}</h4>
                  <p className="text-xs text-zinc-500">{h.targetRole || 'Software Engineer'}</p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(h.createdAt).toLocaleDateString()} at {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={h.atsScore >= 80 ? 'success' : 'secondary'}>
                  {h.atsScore} ATS
                </Badge>
                <Link to={`/resumes/${h.resumeId}/analysis`}>
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
