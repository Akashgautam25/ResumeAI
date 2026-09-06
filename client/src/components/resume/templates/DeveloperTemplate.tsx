import React from 'react';
import { StructuredResume } from '../../../types/index.js';
import { Terminal, Github, Globe, Linkedin, Mail, Phone, Code2 } from 'lucide-react';

export const DeveloperTemplate: React.FC<{ resume: StructuredResume }> = ({ resume }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements } = resume;

  return (
    <div className="resume-page max-w-[800px] mx-auto bg-white text-zinc-900 p-8 font-mono text-xs leading-relaxed shadow-lg print:shadow-none print:p-0">
      {/* Terminal Style Header */}
      <div className="bg-zinc-950 text-zinc-100 p-4 rounded-xl mb-4 font-mono">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-zinc-400 ml-2 font-mono">~/dev/resume.sh</span>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              {personal.name || 'Developer Name'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              $ role: <span className="text-emerald-300 font-mono">{personal.title || 'Software Engineer'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-zinc-300 font-sans">
            {personal.email && (
              <a href={`mailto:${personal.email}`} className="hover:text-emerald-300 flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400" /> {personal.email}
              </a>
            )}
            {personal.github && (
              <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 flex items-center gap-1">
                <Github className="w-3 h-3 text-zinc-400" /> github
              </a>
            )}
            {personal.linkedin && (
              <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-zinc-400" /> in
              </a>
            )}
            {personal.portfolio && (
              <a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400" /> site
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold">&gt;</span> // README.md
          </div>
          <p className="text-zinc-700 font-sans text-xs leading-relaxed">
            {summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="mb-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-zinc-700" /> // TECH_STACK
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
            <div>
              <span className="font-mono font-semibold text-zinc-800 text-[10px] uppercase">Core Languages & Frameworks:</span>
              <p className="text-zinc-700">{skills.technical?.join(' • ')}</p>
            </div>
            <div>
              <span className="font-mono font-semibold text-zinc-800 text-[10px] uppercase">Tools & Environment:</span>
              <p className="text-zinc-700">{skills.tools?.join(' • ')}</p>
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-4">
          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold">&gt;</span> // KEY_REPOSITORIES_AND_PROJECTS
          </div>
          <div className="space-y-3 font-sans">
            {projects.map((proj) => (
              <div key={proj.id} className="border-l-2 border-zinc-900 pl-3">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-950 text-xs">{proj.name}</span>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-zinc-500 hover:text-black">
                        [src]
                      </a>
                    )}
                  </div>
                  {proj.technologies && (
                    <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.2 rounded">
                      {proj.technologies.slice(0, 4).join(', ')}
                    </span>
                  )}
                </div>
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-zinc-700 text-xs">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-4">
          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold">&gt;</span> // WORK_HISTORY
          </div>
          <div className="space-y-3 font-sans">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-950">{exp.position}</span>
                    <span className="text-zinc-600"> @ {exp.company}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-zinc-700 text-xs">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="font-sans">
          <div className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
            <span className="text-zinc-400 font-bold">&gt;</span> // EDUCATION
          </div>
          {education.map((edu) => (
            <div key={edu.id} className="flex justify-between text-xs">
              <div>
                <span className="font-bold text-zinc-900">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
              </div>
              <span className="font-mono text-[10px] text-zinc-500">{edu.startDate} – {edu.endDate}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
