import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { FileCheck2, ArrowRight } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-950">ResumeAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="/#features" className="hover:text-zinc-950 transition-colors">Features</a>
            <a href="/#how-it-works" className="hover:text-zinc-950 transition-colors">How It Works</a>
            <a href="/#scoring" className="hover:text-zinc-950 transition-colors">ATS Scoring</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                {isLoginPage ? (
                  <Link to="/register" className="hidden sm:inline-block">
                    <Button variant="ghost" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" className="hidden sm:inline-block">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                )}
                <Link to="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-zinc-50/70 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950 text-white">
              <FileCheck2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-zinc-900">ResumeAI</span>
            <span>— Analyze. Improve. Tailor. Get Hired.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-zinc-900">Features</a>
            <a href="#scoring" className="hover:text-zinc-900">ATS Engine</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900">GitHub</a>
            <span className="text-zinc-400">© 2026 ResumeAI Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
