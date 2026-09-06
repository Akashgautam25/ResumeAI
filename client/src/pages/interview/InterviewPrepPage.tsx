import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { resumeService } from '../../services/resumeService.js';
import { jobService } from '../../services/jobService.js';
import { interviewService } from '../../services/interviewService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { InterviewSession, InterviewQuestion } from '../../types/index.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { ScoreGauge } from '../../components/ui/ScoreGauge.js';
import { Progress } from '../../components/ui/Progress.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Code2,
  Layers,
  Users,
  MessageSquare,
  Save,
} from 'lucide-react';

export const InterviewPrepPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});

  const { data: resumes = [] } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeService.getResumes(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getJobs(),
  });

  const { data: pastSessions = [] } = useQuery({
    queryKey: ['interview-sessions'],
    queryFn: () => interviewService.getSessions(),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      interviewService.generateInterview({
        resumeId: selectedResumeId,
        jobId: selectedJobId || undefined,
      }),
    onSuccess: (session) => {
      setActiveSession(session);
      success('Tailored interview preparation questions generated!');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Failed to generate interview questions');
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: ({ questionId, note }: { questionId: string; note: string }) =>
      interviewService.updateNotes(questionId, note),
    onSuccess: () => {
      success('Practice notes saved!');
    },
    onError: () => {
      toastError('Failed to save notes');
    },
  });

  const toggleQuestion = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const loadPastSession = async (sessId: string) => {
    try {
      const full = await interviewService.getSessionById(sessId);
      setActiveSession(full);
      const initialNotes: Record<string, string> = {};
      full.questions?.forEach((q) => {
        if (q.userNotes) initialNotes[q.id] = q.userNotes;
      });
      setQuestionNotes(initialNotes);
    } catch {
      toastError('Failed to load past session');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          AI Interview Preparation Coach
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Generate high-signal Technical, Project Deep-Dive, and STAR Behavioral questions based on your actual resume projects.
        </p>
      </div>

      {/* Generator Form */}
      <Card className="p-6 shadow-premium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Select Resume to Interview On
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">Select a Resume...</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.atsScore} ATS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Target Job Description (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">General Software Engineer Role</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.role} @ {j.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {pastSessions.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 overflow-x-auto w-full sm:w-auto">
              <span>Past Sessions:</span>
              {pastSessions.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadPastSession(s.id)}
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-800 text-[11px] font-medium transition-colors"
                >
                  {s.targetRole} ({s.readinessScore}%)
                </button>
              ))}
            </div>
          )}

          <Button
            size="md"
            disabled={!selectedResumeId}
            isLoading={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
            className="w-full sm:w-auto ml-auto"
          >
            Generate Tailored Interview Questions
          </Button>
        </div>
      </Card>

      {/* Generated Questions Session View */}
      {activeSession && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6">
          {/* Readiness Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <ScoreGauge
                score={activeSession.readinessScore}
                size={150}
                strokeWidth={12}
                label="Readiness"
                sublabel="Interview Competitiveness"
              />
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 border-b border-zinc-100">
                <CardTitle>Interview Readiness by Domain</CardTitle>
                <CardDescription>Preparation strength across key interview categories</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Technical Depth</span>
                    <span className="font-bold">{activeSession.categoryScores?.technical || 82}%</span>
                  </div>
                  <Progress value={activeSession.categoryScores?.technical || 82} indicatorClassName="bg-zinc-900" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Project Architecture</span>
                    <span className="font-bold">{activeSession.categoryScores?.projects || 75}%</span>
                  </div>
                  <Progress value={activeSession.categoryScores?.projects || 75} indicatorClassName="bg-emerald-600" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Behavioral (STAR)</span>
                    <span className="font-bold">{activeSession.categoryScores?.behavioral || 81}%</span>
                  </div>
                  <Progress value={activeSession.categoryScores?.behavioral || 81} indicatorClassName="bg-zinc-800" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Clarity & Impact</span>
                    <span className="font-bold">{activeSession.categoryScores?.communication || 74}%</span>
                  </div>
                  <Progress value={activeSession.categoryScores?.communication || 74} indicatorClassName="bg-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List of Interview Questions */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-zinc-950">
              Questions & Answer Frameworks ({activeSession.questions?.length || 0})
            </h3>

            {activeSession.questions?.map((q, idx) => {
              const isExpanded = expandedQuestions[q.id] ?? (idx === 0);
              const difficultyVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
                Easy: 'success',
                Medium: 'warning',
                Hard: 'destructive',
              };

              return (
                <Card key={q.id} className="p-5 transition-all">
                  <div
                    onClick={() => toggleQuestion(q.id)}
                    className="flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" size="sm">{q.category}</Badge>
                          <Badge variant={difficultyVariants[q.difficulty] || 'secondary'} size="sm">
                            {q.difficulty}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-zinc-950 leading-snug">
                          {q.question}
                        </h4>
                      </div>
                    </div>

                    <button className="text-zinc-400 hover:text-zinc-700 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 space-y-4 text-xs animate-in fade-in">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        <span className="font-bold text-zinc-900 block mb-1 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> Why the Interviewer Asks This:
                        </span>
                        <p className="text-zinc-700 leading-relaxed">{q.whyItMatters}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200">
                        <span className="font-bold text-emerald-950 block mb-1 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-600" /> Suggested Answer Framework:
                        </span>
                        <p className="text-zinc-800 whitespace-pre-line leading-relaxed">
                          {q.suggestedAnswerFramework}
                        </p>
                      </div>

                      {q.sampleAnswer && (
                        <div className="p-3 rounded-xl bg-zinc-100/60 border border-zinc-200">
                          <span className="font-bold text-zinc-900 block mb-1">Sample Answer Outline:</span>
                          <p className="text-zinc-700 italic leading-relaxed font-sans">
                            "{q.sampleAnswer}"
                          </p>
                        </div>
                      )}

                      {/* Notes Section */}
                      <div className="pt-2 space-y-2">
                        <label className="font-semibold text-zinc-700 block">Your Practice Notes / Bullet Points:</label>
                        <Textarea
                          rows={3}
                          placeholder="Type your talking points or past stories for this question..."
                          value={questionNotes[q.id] || ''}
                          onChange={(e) => setQuestionNotes({ ...questionNotes, [q.id]: e.target.value })}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              saveNoteMutation.mutate({
                                questionId: q.id,
                                note: questionNotes[q.id] || '',
                              })
                            }
                            leftIcon={<Save className="w-3.5 h-3.5" />}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
