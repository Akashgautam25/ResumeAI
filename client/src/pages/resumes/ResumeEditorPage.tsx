import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeService } from '../../services/resumeService.js';
import { analysisService } from '../../services/analysisService.js';
import { useToast } from '../../contexts/ToastContext.js';
import { StructuredResume, EducationItem, ExperienceItem, ProjectItem } from '../../types/index.js';
import { ResumePreview } from '../../components/resume/ResumePreview.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import html2pdf from 'html2pdf.js';
import {
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Layers,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Eye,
} from 'lucide-react';

const DEFAULT_RESUME: StructuredResume = {
  personal: {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '+1 (555) 000-0000',
    location: 'City, State',
    linkedin: '',
    github: '',
    portfolio: '',
    title: 'Software Engineer',
  },
  summary: 'Proactive software engineer dedicated to building performant full-stack web applications and scalable APIs.',
  education: [
    {
      id: 'edu-1',
      institution: 'University Name',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2022',
      endDate: '2026',
      current: true,
      gpa: '3.8/4.0',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Company',
      position: 'Software Engineering Intern',
      location: 'Remote',
      startDate: 'Jun 2024',
      endDate: 'Aug 2024',
      current: false,
      highlights: [
        'Engineered responsive web applications utilizing React and TypeScript.',
        'Developed REST API endpoints in Node.js and PostgreSQL reducing latency by 25%.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Full-Stack Web Platform',
      role: 'Lead Developer',
      description: 'An interactive web platform with real-time state and database integration.',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      link: 'https://example.com',
      githubUrl: 'https://github.com/example/project',
      highlights: [
        'Architected end-to-end full-stack application with clean modular component architecture.',
        'Implemented type-safe database queries and automated test suites.',
      ],
    },
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs'],
    tools: ['Git', 'GitHub', 'Docker', 'VS Code', 'Postman'],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Agile/Scrum'],
    languages: ['English'],
  },
  certifications: [],
  achievements: [],
};

export const ResumeEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState('My Resume');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [templateId, setTemplateId] = useState('ats-classic');
  const [resumeData, setResumeData] = useState<StructuredResume>(DEFAULT_RESUME);
  const [activeSection, setActiveSection] = useState('personal');
  const [isDownloading, setIsDownloading] = useState(false);

  // AI Assistance Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTargetField, setAiTargetField] = useState<{ section: string; index?: number; bulletIndex?: number } | null>(null);
  const [aiOriginalText, setAiOriginalText] = useState('');
  const [aiImprovedText, setAiImprovedText] = useState('');
  const [aiReason, setAiReason] = useState('');
  const [aiVariations, setAiVariations] = useState<any[]>([]);

  // Fetch Existing Resume if editing
  const { data: existingResume, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeService.getResumeById(id!),
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (existingResume) {
      setTitle(existingResume.title || 'My Resume');
      setTargetRole(existingResume.targetRole || 'Software Engineer');
      setTemplateId(existingResume.templateId || 'ats-classic');
      if (existingResume.structuredData) {
        setResumeData(existingResume.structuredData);
      }
    }
  }, [existingResume]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        return resumeService.createResume({
          title,
          targetRole,
          templateId,
          structuredData: resumeData,
        });
      } else {
        return resumeService.updateResume(id!, {
          title,
          targetRole,
          templateId,
          structuredData: resumeData,
        });
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['resume', saved.id] });
      success('Resume saved successfully!');
      if (isNew) {
        navigate(`/resumes/${saved.id}/editor`, { replace: true });
      }
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || 'Failed to save resume');
    },
  });

  // PDF Export Function
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
        filename: `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`,
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

  // AI Assist Trigger
  const triggerAiImprovement = async (
    type: 'summary' | 'bullet' | 'project' | 'general',
    originalText: string,
    fieldTarget: { section: string; index?: number; bulletIndex?: number }
  ) => {
    if (!originalText || originalText.trim().length < 5) {
      toastError('Please enter some text before requesting AI improvements.');
      return;
    }

    setAiTargetField(fieldTarget);
    setAiOriginalText(originalText);
    setAiModalOpen(true);
    setAiLoading(true);

    try {
      const res = await analysisService.improveSection({
        type,
        originalText,
        context: `Target Role: ${targetRole}. Stack: ${resumeData.skills.technical.join(', ')}`,
      });

      setAiImprovedText(res.improved);
      setAiReason(res.reason);
      setAiVariations(res.variations || []);
    } catch {
      toastError('Failed to generate AI improvement');
      setAiModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI Text to State
  const applyAiText = (text: string) => {
    if (!aiTargetField) return;

    if (aiTargetField.section === 'summary') {
      setResumeData((prev) => ({ ...prev, summary: text }));
    } else if (aiTargetField.section === 'experience' && aiTargetField.index !== undefined && aiTargetField.bulletIndex !== undefined) {
      const exp = [...resumeData.experience];
      exp[aiTargetField.index].highlights[aiTargetField.bulletIndex] = text;
      setResumeData((prev) => ({ ...prev, experience: exp }));
    } else if (aiTargetField.section === 'project' && aiTargetField.index !== undefined && aiTargetField.bulletIndex !== undefined) {
      const proj = [...resumeData.projects];
      proj[aiTargetField.index].highlights[aiTargetField.bulletIndex] = text;
      setResumeData((prev) => ({ ...prev, projects: proj }));
    }

    setAiModalOpen(false);
    success('AI improvement applied!');
  };

  const editorTabs = [
    { id: 'personal', label: 'Contact', icon: <User className="w-4 h-4" /> },
    { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code2 className="w-4 h-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, count: resumeData.experience.length },
    { id: 'projects', label: 'Projects', icon: <Layers className="w-4 h-4" />, count: resumeData.projects.length },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, count: resumeData.education.length },
    { id: 'certifications', label: 'Honors & Certs', icon: <Award className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl sm:text-2xl font-bold text-zinc-950 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-950 focus:outline-none w-full"
            placeholder="Resume Title..."
          />
          <div className="text-xs text-zinc-500 mt-1">Live interactive builder with instant preview & PDF generator</div>
        </div>

        {/* Template Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
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

          <Button
            size="sm"
            variant="outline"
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save
          </Button>

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

      {/* Split Workspace: Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4">
            <Tabs tabs={editorTabs} activeTab={activeSection} onChange={setActiveSection} />

            <div className="pt-5 space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      value={resumeData.personal.name}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, name: e.target.value } })
                      }
                    />
                    <Input
                      label="Target Professional Title"
                      value={resumeData.personal.title || ''}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, title: e.target.value } })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Email"
                      type="email"
                      value={resumeData.personal.email}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, email: e.target.value } })
                      }
                    />
                    <Input
                      label="Phone"
                      value={resumeData.personal.phone}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, phone: e.target.value } })
                      }
                    />
                  </div>
                  <Input
                    label="Location (City, State / Country)"
                    value={resumeData.personal.location}
                    onChange={(e) =>
                      setResumeData({ ...resumeData, personal: { ...resumeData.personal, location: e.target.value } })
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="LinkedIn URL"
                      placeholder="linkedin.com/in/..."
                      value={resumeData.personal.linkedin}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, linkedin: e.target.value } })
                      }
                    />
                    <Input
                      label="GitHub URL"
                      placeholder="github.com/..."
                      value={resumeData.personal.github}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, github: e.target.value } })
                      }
                    />
                    <Input
                      label="Portfolio URL"
                      placeholder="portfolio.dev"
                      value={resumeData.personal.portfolio}
                      onChange={(e) =>
                        setResumeData({ ...resumeData, personal: { ...resumeData.personal, portfolio: e.target.value } })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              {activeSection === 'summary' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700">Professional Summary</label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-zinc-900 border-zinc-300"
                      onClick={() =>
                        triggerAiImprovement('summary', resumeData.summary, { section: 'summary' })
                      }
                      leftIcon={<Sparkles className="w-3 h-3 text-amber-500" />}
                    >
                      ⚡ Improve Summary with AI
                    </Button>
                  </div>
                  <Textarea
                    rows={6}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    placeholder="Write a concise 2-3 sentence overview highlighting your engineering specializations..."
                  />
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Technical Skills (Languages, Frameworks, DBs)
                    </label>
                    <Input
                      placeholder="Add skills separated by comma (e.g. React, TypeScript, Node.js)"
                      value={resumeData.skills.technical.join(', ')}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: {
                            ...resumeData.skills,
                            technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Developer Tools & Platforms
                    </label>
                    <Input
                      placeholder="e.g. Git, Docker, VS Code, Postman, AWS"
                      value={resumeData.skills.tools.join(', ')}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: {
                            ...resumeData.skills,
                            tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Soft Skills & Core Competencies
                    </label>
                    <Input
                      placeholder="e.g. Agile/Scrum, Code Reviews, Problem Solving"
                      value={resumeData.skills.softSkills.join(', ')}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: {
                            ...resumeData.skills,
                            softSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div className="space-y-6">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Experience #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = resumeData.experience.filter((_, i) => i !== idx);
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Position / Title"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].position = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                        <Input
                          label="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].company = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="Start Date"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].startDate = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                        <Input
                          label="End Date"
                          value={exp.endDate}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].endDate = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                        <Input
                          label="Location"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].location = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                      </div>

                      {/* Bullets */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 block">Bullet Points</label>
                        {exp.highlights.map((bullet, bIdx) => (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex gap-2 items-start">
                              <Textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[idx].highlights[bIdx] = e.target.value;
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updated = [...resumeData.experience];
                                  updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== bIdx);
                                  setResumeData({ ...resumeData, experience: updated });
                                }}
                                className="text-zinc-400 hover:text-rose-500 mt-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[11px] h-6 text-zinc-700 hover:text-zinc-950"
                              onClick={() =>
                                triggerAiImprovement('bullet', bullet, {
                                  section: 'experience',
                                  index: idx,
                                  bulletIndex: bIdx,
                                })
                              }
                              leftIcon={<Sparkles className="w-3 h-3 text-amber-500" />}
                            >
                              ⚡ Make Impactful with AI
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => {
                            const updated = [...resumeData.experience];
                            updated[idx].highlights.push('Engineered new software component using modern development practices.');
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                          leftIcon={<Plus className="w-3 h-3" />}
                        >
                          Add Bullet Point
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        experience: [
                          ...resumeData.experience,
                          {
                            id: `exp-${Date.now()}`,
                            company: 'New Company',
                            position: 'Software Engineer',
                            location: 'Location',
                            startDate: '2023',
                            endDate: 'Present',
                            current: true,
                            highlights: ['Contributed to core feature delivery and testing.'],
                          },
                        ],
                      });
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Experience
                  </Button>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div className="space-y-6">
                  {resumeData.projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Project #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = resumeData.projects.filter((_, i) => i !== idx);
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Project Name"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].name = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                        />
                        <Input
                          label="Role"
                          value={proj.role || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].role = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                        />
                      </div>

                      <Input
                        label="Technologies Used"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => {
                          const updated = [...resumeData.projects];
                          updated[idx].technologies = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setResumeData({ ...resumeData, projects: updated });
                        }}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Live Demo Link"
                          placeholder="https://..."
                          value={proj.link || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].link = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                        />
                        <Input
                          label="GitHub Repo URL"
                          placeholder="https://github.com/..."
                          value={proj.githubUrl || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[idx].githubUrl = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                        />
                      </div>

                      {/* Bullets */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 block">Project Highlights</label>
                        {proj.highlights.map((bullet, bIdx) => (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex gap-2 items-start">
                              <Textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => {
                                  const updated = [...resumeData.projects];
                                  updated[idx].highlights[bIdx] = e.target.value;
                                  setResumeData({ ...resumeData, projects: updated });
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updated = [...resumeData.projects];
                                  updated[idx].highlights = updated[idx].highlights.filter((_, i) => i !== bIdx);
                                  setResumeData({ ...resumeData, projects: updated });
                                }}
                                className="text-zinc-400 hover:text-rose-500 mt-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[11px] h-6 text-zinc-700 hover:text-zinc-950"
                              onClick={() =>
                                triggerAiImprovement('bullet', bullet, {
                                  section: 'project',
                                  index: idx,
                                  bulletIndex: bIdx,
                                })
                              }
                              leftIcon={<Sparkles className="w-3 h-3 text-amber-500" />}
                            >
                              ⚡ Make Impactful with AI
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => {
                            const updated = [...resumeData.projects];
                            updated[idx].highlights.push('Developed scalable frontend and backend components.');
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                          leftIcon={<Plus className="w-3 h-3" />}
                        >
                          Add Project Highlight
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setResumeData({
                        ...resumeData,
                        projects: [
                          ...resumeData.projects,
                          {
                            id: `proj-${Date.now()}`,
                            name: 'New Project',
                            role: 'Lead Developer',
                            description: '',
                            technologies: ['React', 'TypeScript', 'Node.js'],
                            highlights: ['Architected modern web application with database persistence.'],
                          },
                        ],
                      });
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Project
                  </Button>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  {resumeData.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Institution / University"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].institution = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                        />
                        <Input
                          label="Degree"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].degree = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].fieldOfStudy = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                        />
                        <Input
                          label="Dates"
                          value={`${edu.startDate} - ${edu.endDate}`}
                          onChange={(e) => {
                            const parts = e.target.value.split('-');
                            const updated = [...resumeData.education];
                            updated[idx].startDate = parts[0]?.trim() || '';
                            updated[idx].endDate = parts[1]?.trim() || '';
                            setResumeData({ ...resumeData, education: updated });
                          }}
                        />
                        <Input
                          label="GPA"
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.education];
                            updated[idx].gpa = e.target.value;
                            setResumeData({ ...resumeData, education: updated });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Preview Column (6 cols) */}
        <div className="lg:col-span-6 sticky top-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live A4 Document Preview
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Template: {templateId}</span>
          </div>
          <ResumePreview resume={resumeData} templateId={templateId} />
        </div>
      </div>

      {/* AI Assistance Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="AI Resume Assistant"
        description="Factual-preserving enhancement with commanding action verbs and metric focus."
      >
        {aiLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="text-xs font-semibold text-zinc-700">Generating high-impact revisions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
              <span className="font-semibold text-zinc-500 block mb-1">ORIGINAL TEXT:</span>
              <p className="text-zinc-800">{aiOriginalText}</p>
            </div>

            {/* Primary Recommendation */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">RECOMMENDED REVISION</span>
                <Button size="sm" onClick={() => applyAiText(aiImprovedText)}>
                  Apply This
                </Button>
              </div>
              <p className="text-xs font-medium text-zinc-950">{aiImprovedText}</p>
              {aiReason && <p className="text-[11px] text-zinc-600 mt-1">💡 {aiReason}</p>}
            </div>

            {/* Alternative Variations */}
            {aiVariations.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-zinc-700 block">Alternative Styles:</span>
                {aiVariations.map((v, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-zinc-900 block">{v.style}</span>
                      <p className="text-zinc-700">{v.text}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => applyAiText(v.text)}>
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
