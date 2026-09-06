import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../../services/resumeService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Progress } from '../../components/ui/Progress.js';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const ResumeUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'extracting' | 'parsing' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { success } = useToast();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();

    if (!validTypes.includes(selectedFile.type) && ext !== 'pdf' && ext !== 'docx' && ext !== 'doc') {
      setError('Please upload a valid PDF or DOCX resume document.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    try {
      setError('');
      setStage('uploading');
      setProgress(25);

      // Simulated progressive pipeline UI
      setTimeout(() => {
        setStage('extracting');
        setProgress(50);
      }, 500);

      setTimeout(() => {
        setStage('parsing');
        setProgress(75);
      }, 1000);

      setTimeout(() => {
        setStage('analyzing');
        setProgress(90);
      }, 1500);

      const result = await resumeService.uploadResume(file);

      setProgress(100);
      setStage('complete');
      success('Resume parsed and analyzed successfully!');

      setTimeout(() => {
        navigate(`/resumes/${result.resume.id}/analysis`);
      }, 800);
    } catch (err: any) {
      setStage('idle');
      setProgress(0);
      setError(err.response?.data?.error || 'Failed to parse resume. Please try a different file.');
    }
  };

  const stageMessages = {
    idle: '',
    uploading: 'Uploading resume document...',
    extracting: 'Extracting raw document text & layout...',
    parsing: 'Parsing structured resume sections & skills...',
    analyzing: 'Evaluating deterministic ATS rules & AI feedback...',
    complete: 'Analysis complete! Redirecting to report...',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-1 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Upload Your Resume
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Upload your PDF or DOCX resume for full ATS scoring and section extraction.
        </p>
      </div>

      <Card className="p-8 shadow-premium">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-zinc-900 bg-zinc-100/80 scale-[1.01]'
              : file
              ? 'border-emerald-400 bg-emerald-50/20'
              : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-200 text-zinc-800 shadow-sm mb-4">
            {file ? (
              <FileCheck2 className="w-8 h-8 text-emerald-600" />
            ) : (
              <UploadCloud className="w-8 h-8 text-zinc-700" />
            )}
          </div>

          {file ? (
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-zinc-900">{file.name}</span>
              <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <span className="text-sm font-semibold text-zinc-800">
                Drag and drop your resume here, or <span className="text-zinc-950 underline underline-offset-2">browse</span>
              </span>
              <p className="text-xs text-zinc-600">Supports PDF and DOCX files up to 10MB</p>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Processing Progress */}
        {stage !== 'idle' && (
          <div className="mt-6 space-y-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                {stageMessages[stage]}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-medium pt-1 text-zinc-500">
              <span className={progress >= 25 ? 'text-zinc-950 font-bold' : ''}>1. Upload</span>
              <span className={progress >= 50 ? 'text-zinc-950 font-bold' : ''}>2. Extract</span>
              <span className={progress >= 75 ? 'text-zinc-950 font-bold' : ''}>3. Parse</span>
              <span className={progress >= 90 ? 'text-zinc-950 font-bold' : ''}>4. ATS Score</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-3">
          {file && stage === 'idle' && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Remove File
            </Button>
          )}
          <Button
            size="md"
            disabled={!file || stage !== 'idle'}
            isLoading={stage !== 'idle'}
            onClick={handleUploadAndAnalyze}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Start ATS Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
};
