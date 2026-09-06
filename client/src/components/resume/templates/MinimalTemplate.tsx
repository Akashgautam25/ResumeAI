import React from 'react';
import { StructuredResume } from '../../../types/index.js';

export const MinimalTemplate: React.FC<{ resume: StructuredResume }> = ({ resume }) => {
  const { personal, summary, education, experience, projects, skills, certifications, achievements } = resume;

  return (
    <div className="resume-page max-w-[800px] mx-auto bg-white text-zinc-900 p-10 font-serif text-xs leading-relaxed shadow-lg print:shadow-none print:p-0">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-normal tracking-tight text-zinc-950 font-serif mb-1">
          {personal.name || 'Your Full Name'}
        </h1>
        {personal.title && (
          <p className="text-xs font-sans tracking-widest text-zinc-500 uppercase mb-2">
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-sans text-zinc-500">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && (
            <>
              <span>•</span>
              <a href={`mailto:${personal.email}`} className="hover:text-zinc-950">{personal.email}</a>
            </>
          )}
          {personal.phone && (
            <>
              <span>•</span>
              <span>{personal.phone}</span>
            </>
          )}
          {personal.linkedin && (
            <>
              <span>•</span>
              <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-zinc-950">
                LinkedIn
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span>•</span>
              <a href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`} target="_blank" rel="noreferrer" className="hover:text-zinc-950">
                GitHub
              </a>
            </>
          )}
        </div>
      </div>

      <div className="w-12 h-px bg-zinc-300 mx-auto mb-6"></div>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <p className="text-zinc-700 leading-relaxed font-serif text-justify text-xs italic">
            {summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-1 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-serif font-bold text-zinc-950 text-[13px]">{exp.position}</h3>
                  <span className="font-sans text-[10px] text-zinc-400 uppercase tracking-wider">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="font-sans text-[11px] text-zinc-500 mb-1">{exp.company} {exp.location && `• ${exp.location}`}</div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-zinc-700 font-sans text-xs">
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
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-1 mb-3">
            Selected Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <div className="font-serif font-bold text-zinc-950 text-xs">{proj.name}</div>
                  {proj.technologies && (
                    <span className="font-sans text-[10px] text-zinc-400 tracking-wide">
                      {proj.technologies.slice(0, 4).join(', ')}
                    </span>
                  )}
                </div>
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-zinc-700 font-sans text-xs">
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

      {/* Skills */}
      {skills && (
        <section className="mb-6">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-1 mb-2">
            Expertise & Tools
          </h2>
          <div className="font-sans text-xs text-zinc-700 space-y-1">
            {skills.technical && skills.technical.length > 0 && (
              <div>
                <span className="text-zinc-500 font-medium">Technical: </span>
                {skills.technical.join(', ')}
              </div>
            )}
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <span className="text-zinc-500 font-medium">Tools: </span>
                {skills.tools.join(', ')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2 font-sans text-xs">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-zinc-900">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
                </div>
                <span className="text-[10px] text-zinc-400">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
