import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resumeService } from '../../services/resumeService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { ResumePreview } from '../../components/resume/ResumePreview.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import html2pdf from 'html2pdf.js';
import { Edit3, Download, BarChart3, ArrowLeft, Eye } from 'lucide-react';

export const ResumeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error: toastError } = useToast();
  const [templateId, setTemplateId] = useState('ats-classic');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: resume, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeService.getResumeById(id!),
    enabled: !!id,
  });

  const handleDownloadPdf = async () => {
    const element = document.getElementById('resume-preview-document');
    if (!element) {
      toastError('Preview element not found');
      return;
    }

    try {
      setIsDownloading(true);
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${(resume?.structuredData?.personal?.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().from(element).set(opt).save();
      success('PDF downloaded successfully!');
    } catch {
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!resume) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-zinc-900">Resume Not Found</h2>
        <Link to="/resumes" className="mt-4 inline-block">
          <Button size="sm">Back to Resumes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <Link to="/resumes" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Resumes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{resume.title}</h1>
            <Badge variant="success">{resume.atsScore} ATS</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            {['ats-classic', 'modern', 'developer', 'minimal'].map((t) => (
              <button
                key={t}
                onClick={() => setTemplateId(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  templateId === t ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>

          <Link to={`/resumes/${resume.id}/editor`}>
            <Button size="sm" variant="outline" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
              Edit Builder
            </Button>
          </Link>
          <Link to={`/resumes/${resume.id}/analysis`}>
            <Button size="sm" variant="secondary" leftIcon={<BarChart3 className="w-3.5 h-3.5" />}>
              View Analysis
            </Button>
          </Link>
          <Button
            size="sm"
            isLoading={isDownloading}
            onClick={handleDownloadPdf}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Render Document */}
      <ResumePreview resume={resume.structuredData} templateId={templateId} />
    </div>
  );
};
