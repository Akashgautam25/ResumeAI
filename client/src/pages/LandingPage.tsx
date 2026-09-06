import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { ScoreGauge } from '../components/ui/ScoreGauge.js';
import {
  Sparkles,
  Target,
  FileSearch,
  Wand2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Code2,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    await loginWithDemo();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 px-4 sm:px-8 max-w-6xl mx-auto text-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-800 mb-6 shadow-subtle animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
          <span>Next-Gen AI Resume & Career Intelligence</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 max-w-4xl mx-auto leading-[1.1] mb-6">
          Build a Resume That <br className="hidden sm:inline" />
          <span className="text-zinc-900 underline decoration-zinc-300 underline-offset-8">Gets Noticed.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Stop getting lost in the Applicant Tracking System black hole. ResumeAI combines <strong className="text-zinc-900 font-semibold">15+ deterministic rules</strong> with <strong className="text-zinc-900 font-semibold">deep AI reasoning</strong> to score, optimize, and tailor your resume for top tech roles.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Analyze My Resume
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={handleDemoClick}
            className="w-full sm:w-auto"
            leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
          >
            Explore Live Demo
          </Button>
        </div>

        <p className="text-xs text-zinc-600 mt-3">No credit card required • 100% free for students & job seekers</p>

        {/* Live ATS Dashboard Preview Card */}
        <div className="mt-16 rounded-3xl border border-zinc-200/80 bg-zinc-50/80 p-4 sm:p-8 shadow-premium max-w-4xl mx-auto backdrop-blur-sm">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-subtle">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-zinc-100">
              <div className="flex items-center gap-6">
                <ScoreGauge score={87} size={130} label="ATS Score" sublabel="Top 8% Candidate" />
                <div className="text-left space-y-1">
                  <h3 className="text-xl font-bold text-zinc-950">Full-Stack Software Engineer</h3>
                  <p className="text-xs text-zinc-500">Alex Chen • Analyzed against Top Tier Tech ATS criteria</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      ✓ Strong Metrics Density
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold border border-zinc-200">
                      ✓ 28 Industry Keywords
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full md:w-auto text-left">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xs text-zinc-500">Skills Coverage</div>
                  <div className="text-base font-bold text-zinc-900">92%</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xs text-zinc-500">Project Impact</div>
                  <div className="text-base font-bold text-zinc-900">88%</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xs text-zinc-500">ATS Parsing</div>
                  <div className="text-base font-bold text-zinc-900">96%</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xs text-zinc-500">Action Verbs</div>
                  <div className="text-base font-bold text-zinc-900">90%</div>
                </div>
              </div>
            </div>

            {/* Before vs After Snippet */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-2">
                  <span>BEFORE AI OPTIMIZATION</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 rounded">Weak Verb & No Metrics</span>
                </div>
                <p className="text-xs text-zinc-700 line-through">
                  "Built a web dashboard for metrics and handled backend data."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-2">
                  <span>AFTER RESUMEAI ENHANCEMENT</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 rounded">Commanding Verb + Measurable</span>
                </div>
                <p className="text-xs text-zinc-900 font-medium">
                  "Architected real-time metrics streaming dashboard processing 50,000+ telemetry events/sec with sub-50ms latency."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Everything You Need</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Complete Career Intelligence Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-premium transition-all">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
              <FileSearch className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1.5">Hybrid ATS Scoring</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Transparent 10-category breakdown with 15+ deterministic rules checking bullet metrics, action verb ratios, and parsing fidelity.
            </p>
          </Card>

          <Card className="hover:shadow-premium transition-all">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1.5">Job Description Matcher</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Paste target job requirements to instantly identify matched skills (✓), partial matches (⚠), and critical missing keywords (✗).
            </p>
          </Card>

          <Card className="hover:shadow-premium transition-all">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
              <Wand2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1.5">Factual AI Improver</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Generate impactful bullet points and summaries without fabricating false metrics, companies, or accomplishments.
            </p>
          </Card>

          <Card className="hover:shadow-premium transition-all">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1.5">Interactive Resume Builder</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Structured multi-section editor with live template preview, section reordering, and autosave.
            </p>
          </Card>

          <Card className="hover:shadow-premium transition-all">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1.5">4 Professional Templates</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Choose from ATS Classic, Modern, Developer, and Minimal templates with crisp vector PDF export.
            </p>
          </Card>

          <Card className="hover:shadow-premium transition-all">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-zinc-950 mb-1.5">AI Interview Preparation</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Generate custom Technical, Project, and STAR Behavioral questions tailored to your actual resume projects and target role.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Simple 5-Step Workflow</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            From Upload to Interview-Ready
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Drag and drop PDF or DOCX resume' },
            { step: '02', title: 'ATS Analysis', desc: 'Instant score, strengths & weaknesses' },
            { step: '03', title: 'AI Enhance', desc: '1-click improvements with factual guardrails' },
            { step: '04', title: 'Tailor to Job', desc: 'Align keywords and missing skills' },
            { step: '05', title: 'Export & Ace', desc: 'Clean PDF export and interview prep' },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-subtle text-left relative">
              <div className="text-xs font-mono font-bold text-zinc-400 mb-2">{item.step}</div>
              <h4 className="text-sm font-bold text-zinc-950 mb-1">{item.title}</h4>
              <p className="text-xs text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Build Your Winning Resume?
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Join students and engineers landing interviews at top tech companies. Analyze your resume in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="outline" size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 border-none font-bold">
                  Get Started Free
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleDemoClick}
                className="text-zinc-300 hover:text-white hover:bg-zinc-900"
              >
                Try Demo Account →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
