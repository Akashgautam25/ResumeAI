import React from 'react';
import { StructuredResume } from '../../../types/index.js';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export const ATSClassicTemplate: React.FC<{ resume: StructuredResume }> = ({ resume }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements, leadership } = resume;

  return (
    <div className="resume-page max-w-[800px] mx-auto bg-white text-zinc-900 p-8 font-sans text-xs leading-relaxed shadow-lg print:shadow-none print:p-0">
      {/* Header */}
      <div className="text-center border-b border-zinc-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-zinc-950 mb-1">
          {personal.name || 'Your Full Name'}
        </h1>
        {personal.title && (
          <p className="text-xs font-semibold text-zinc-700 tracking-wide mb-2 uppercase">
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-600">
          {personal.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-zinc-500" />
              <a href={`mailto:${personal.email}`} className="hover:underline">{personal.email}</a>
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-zinc-500" />
              <span>{personal.phone}</span>
            </span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-500" />
              <span>{personal.location}</span>
            </span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-zinc-500" />
              <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">
                LinkedIn
              </a>
            </span>
          )}
          {personal.github && (
            <span className="flex items-center gap-1">
              <Github className="w-3 h-3 text-zinc-500" />
              <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub
              </a>
            </span>
          )}
          {personal.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-zinc-500" />
              <a href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`} target="_blank" rel="noreferrer" className="hover:underline">
                Portfolio
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-zinc-700 leading-normal text-justify">
            {summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {((skills?.technical && skills.technical.length > 0) || (skills?.tools && skills.tools.length > 0)) && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5">
            Technical & Core Skills
          </h2>
          <div className="space-y-1 text-zinc-700">
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <strong className="text-zinc-900 font-semibold">Languages & Frameworks: </strong>
                <span>{skills.technical.join(', ')}</span>
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <strong className="text-zinc-900 font-semibold">Developer Tools & Platforms: </strong>
                <span>{skills.tools.join(', ')}</span>
              </div>
            )}
            {skills.softSkills && skills.softSkills.length > 0 && (
              <div>
                <strong className="text-zinc-900 font-semibold">Competencies: </strong>
                <span>{skills.softSkills.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-900 text-[13px]">{exp.position}</span>
                    <span className="text-zinc-600 font-medium"> — {exp.company}</span>
                    {exp.location && <span className="text-zinc-500 text-[11px]"> ({exp.location})</span>}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-600 whitespace-nowrap">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-zinc-700">
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
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2">
            Key Technical Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-900 text-[13px]">{proj.name}</span>
                    {proj.role && <span className="text-zinc-600"> | {proj.role}</span>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-zinc-500 text-[11px]"> ({proj.technologies.join(', ')})</span>
                    )}
                  </div>
                  {proj.link && (
                    <a
                      href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-600 hover:underline"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-zinc-700">
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

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-zinc-900">{edu.institution}</span>
                    {edu.location && <span className="text-zinc-500 text-[11px]"> — {edu.location}</span>}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-600">
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
                <div className="text-zinc-700 flex justify-between">
                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  {edu.gpa && <span className="font-medium text-zinc-600">GPA: {edu.gpa}</span>}
                </div>
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-zinc-600 text-[11px]">
                    {edu.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Achievements */}
      {((certifications && certifications.length > 0) || (achievements && achievements.length > 0)) && (
        <section className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5">
            Certifications & Honors
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-0.5 text-zinc-700">
            {certifications?.map((c) => (
              <li key={c.id}>
                <span className="font-semibold text-zinc-900">{c.name}</span> — {c.issuer} ({c.issueDate})
              </li>
            ))}
            {achievements?.map((a) => (
              <li key={a.id}>
                <span className="font-semibold text-zinc-900">{a.title}</span>: {a.description}
              </li>
            ))}
            {leadership?.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
