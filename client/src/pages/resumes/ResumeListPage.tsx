import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { resumeService } from '../../services/resumeService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import {
  FileText,
  Upload,
  Plus,
  BarChart3,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';

export const ResumeListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes(),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => resumeService.duplicateResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      success('Resume duplicated successfully');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Failed to duplicate resume');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      success('Resume deleted successfully');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Failed to delete resume');
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">My Resumes</h1>
          <p className="text-xs text-zinc-500 mt-1">Manage multiple resume versions, templates, and tailored variations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/resumes/upload">
            <Button size="sm" variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
              Upload PDF / DOCX
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => {
              navigate('/resumes/new/editor');
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Blank Resume
          </Button>
        </div>
      </div>

      {/* Grid of Resumes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No Resumes Created Yet"
          description="Upload an existing resume document or build one from scratch using our structured editor."
          actionLabel="Upload First Resume"
          onAction={() => navigate('/resumes/upload')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="flex flex-col justify-between hover:border-zinc-300 transition-all group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-950 group-hover:text-zinc-900 transition-colors line-clamp-1">
                      {resume.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{resume.targetRole || 'Software Engineer'}</p>
                  </div>
                  <Badge variant={resume.atsScore >= 80 ? 'success' : resume.atsScore >= 65 ? 'default' : 'warning'}>
                    {resume.atsScore} ATS
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-500 py-3 border-y border-zinc-100 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Template:</span>
                    <span className="font-semibold text-zinc-800 capitalize">{resume.templateId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Versions:</span>
                    <span className="font-semibold text-zinc-800">{resume.versionCount || 1} snapshot(s)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link to={`/resumes/${resume.id}/analysis`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs" leftIcon={<BarChart3 className="w-3.5 h-3.5" />}>
                      ATS Analysis
                    </Button>
                  </Link>
                  <Link to={`/resumes/${resume.id}/editor`} className="w-full">
                    <Button size="sm" className="w-full text-xs" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                      Edit Builder
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                  <Link to={`/resumes/${resume.id}`} className="text-zinc-600 hover:text-zinc-950 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Live Preview
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => duplicateMutation.mutate(resume.id)}
                      title="Duplicate Resume"
                      className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${resume.title}"?`)) {
                          deleteMutation.mutate(resume.id);
                        }
                      }}
                      title="Delete Resume"
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
