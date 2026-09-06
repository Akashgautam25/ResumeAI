import React from 'react';
import { StructuredResume } from '../../../types/index.js';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

export const ModernTemplate: React.FC<{ resume: StructuredResume }> = ({ resume }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements } = resume;

  return (
    <div className="resume-page max-w-[800px] mx-auto bg-white text-zinc-900 p-8 font-sans text-xs leading-relaxed shadow-lg print:shadow-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5 mb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 mb-1">
            {personal.name || 'Your Full Name'}
          </h1>
          {personal.title && (
            <p className="text-sm font-semibold text-zinc-600 tracking-wide uppercase">
              {personal.title}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-zinc-600">
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="flex items-center gap-1.5 hover:text-zinc-950">
              <span>{personal.email}</span>
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1.5">
              <span>{personal.phone}</span>
              <Phone className="w-3.5 h-3.5 text-zinc-500" />
            </span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1.5">
              <span>{personal.location}</span>
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            </span>
          )}
          <div className="flex items-center gap-2 mt-1">
            {personal.linkedin && (
              <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-900">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {personal.github && (
              <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-900">
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {personal.portfolio && (
              <a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-900">
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80">
          <p className="text-zinc-700 leading-relaxed italic text-xs">
            "{summary}"
          </p>
        </div>
      )}

      {/* Skills */}
      {((skills?.technical && skills.technical.length > 0) || (skills?.tools && skills.tools.length > 0)) && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-1 border-b border-zinc-200 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900"></span>
            Technical Expertise
          </h2>
          <div className="space-y-2">
            {skills.technical && skills.technical.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-semibold text-zinc-500 w-24 flex-shrink-0">Stack:</span>
                {skills.technical.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-semibold text-zinc-500 w-24 flex-shrink-0">Tools & Dev:</span>
                {skills.tools.map((tool, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] border border-zinc-200">
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-1 border-b border-zinc-200 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900"></span>
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="relative pl-3 border-l-2 border-zinc-200">
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <h3 className="font-bold text-zinc-950 text-sm">{exp.position}</h3>
                    <p className="text-zinc-600 font-medium text-[11px]">{exp.company} {exp.location && `• ${exp.location}`}</p>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500 px-2 py-0.5 bg-zinc-100 rounded">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700 text-xs">
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

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-1 border-b border-zinc-200 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900"></span>
            Featured Projects
          </h2>
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className="rounded-xl border border-zinc-200 p-3 bg-zinc-50/50">
                <div className="flex justify-between items-baseline mb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-950 text-sm">{proj.name}</h3>
                    {proj.role && <span className="text-[11px] text-zinc-500 font-medium">({proj.role})</span>}
                  </div>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-700 font-medium flex items-center gap-1 hover:text-black"
                    >
                      <span>Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {proj.technologies.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-zinc-200 text-zinc-600">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-zinc-700 text-xs">
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

      {/* Education & Honors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {education && education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-1 border-b border-zinc-200 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-900"></span>
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="font-bold text-zinc-950">{edu.institution}</div>
                <div className="text-zinc-600 text-[11px]">{edu.degree} in {edu.fieldOfStudy}</div>
                <div className="text-zinc-500 text-[11px] flex justify-between mt-0.5">
                  <span>{edu.startDate} – {edu.current ? 'Present' : edu.endDate}</span>
                  {edu.gpa && <span className="font-semibold text-zinc-700">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </section>
        )}

        {((certifications && certifications.length > 0) || (achievements && achievements.length > 0)) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-1 border-b border-zinc-200 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-900"></span>
              Certifications & Awards
            </h2>
            <div className="space-y-1.5 text-zinc-700">
              {certifications?.map((c) => (
                <div key={c.id} className="text-[11px]">
                  <span className="font-semibold text-zinc-950">{c.name}</span>
                  <div className="text-zinc-500">{c.issuer} ({c.issueDate})</div>
                </div>
              ))}
              {achievements?.map((a) => (
                <div key={a.id} className="text-[11px]">
                  <span className="font-semibold text-zinc-950">{a.title}</span>
                  <div className="text-zinc-500">{a.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
