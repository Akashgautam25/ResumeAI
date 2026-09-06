import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionService, ComparisonResult } from '../../services/versionService.js';
import { resumeService } from '../../services/resumeService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Layers,
  ArrowRight,
  GitCompare,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const ResumeVersionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedVersionA, setSelectedVersionA] = useState<string>('');
  const [selectedVersionB, setSelectedVersionB] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);

  const { data: resume } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeService.getResumeById(id!),
    enabled: !!id,
  });

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', id],
    queryFn: () => versionService.getVersions(id!),
    enabled: !!id,
  });

  const createVersionMutation = useMutation({
    mutationFn: () =>
      versionService.createVersion(id!, {
        title: `v${versions.length + 1}.0 — Snapshot`,
        changeSummary: 'Manual version snapshot created from builder',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', id] });
      success('New version snapshot saved!');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Failed to create version');
    },
  });

  const handleCompare = async () => {
    if (!selectedVersionA || !selectedVersionB) {
      toastError('Please select two versions to compare');
      return;
    }

    try {
      setComparing(true);
      const res = await versionService.compareVersions(selectedVersionA, selectedVersionB);
      setComparisonResult(res);
      setCompareModalOpen(true);
    } catch {
      toastError('Failed to compare versions');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <Link to={`/resumes/${id}`} className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Resume
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Version History & Comparison
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {resume?.title} • Track ATS score changes and iterations over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            isLoading={createVersionMutation.isPending}
            onClick={() => createVersionMutation.mutate()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Snapshot
          </Button>
        </div>
      </div>

      {/* Version Comparison Selector Bar */}
      {versions.length >= 2 && (
        <Card className="p-4 bg-zinc-50/50 border-zinc-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-700 w-full sm:w-auto">
              <GitCompare className="w-4 h-4 text-zinc-950" />
              <span>Compare Versions:</span>
              <select
                value={selectedVersionA}
                onChange={(e) => setSelectedVersionA(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs"
              >
                <option value="">Select Base (v1)</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNumber} ({v.atsScore} ATS)
                  </option>
                ))}
              </select>
              <span>vs</span>
              <select
                value={selectedVersionB}
                onChange={(e) => setSelectedVersionB(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs"
              >
                <option value="">Select Target (v2)</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNumber} ({v.atsScore} ATS)
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              disabled={!selectedVersionA || !selectedVersionB}
              isLoading={comparing}
              onClick={handleCompare}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Compare Side-by-Side
            </Button>
          </div>
        </Card>
      )}

      {/* List of Version Snapshots */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : versions.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-8">No version snapshots saved yet.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white shadow-subtle hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 font-bold text-xs text-zinc-900 border border-zinc-200">
                  v{v.versionNumber}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">{v.title}</h4>
                  <p className="text-xs text-zinc-500">{v.changeSummary || 'Snapshot created'}</p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={v.atsScore >= 80 ? 'success' : 'secondary'}>
                  {v.atsScore} ATS Score
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      <Modal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Resume Version Comparison"
        description="Side-by-side analysis of structural enhancements and ATS score progression"
        maxWidth="2xl"
      >
        {comparisonResult && (
          <div className="space-y-6">
            {/* Score Delta Banner */}
            <div className="p-4 rounded-2xl bg-zinc-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400">Score Progression</span>
                <div className="text-xl font-bold">
                  v{comparisonResult.versionA.versionNumber} ({comparisonResult.versionA.atsScore} ATS) → v{comparisonResult.versionB.versionNumber} ({comparisonResult.versionB.atsScore} ATS)
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-xl text-base font-bold flex items-center gap-1 ${
                  comparisonResult.scoreDelta >= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{comparisonResult.scoreDelta >= 0 ? `+${comparisonResult.scoreDelta}` : comparisonResult.scoreDelta} PTS</span>
              </div>
            </div>

            {/* Changes Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="p-3 font-semibold">Category / Field</th>
                    <th className="p-3 font-semibold">Version {comparisonResult.versionA.versionNumber}</th>
                    <th className="p-3 font-semibold">Version {comparisonResult.versionB.versionNumber}</th>
                    <th className="p-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {comparisonResult.changes.map((c, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50">
                      <td className="p-3 font-medium text-zinc-900">{c.field}</td>
                      <td className="p-3 text-zinc-600">{c.versionA}</td>
                      <td className="p-3 text-zinc-900 font-semibold">{c.versionB}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-medium">
                          {c.improvement || c.status || 'Updated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
