import { describe, it, expect } from 'vitest';
import { parseResumeTextToStructured } from '../src/services/parser/sectionExtractor.js';
import { analyzeResume } from '../src/services/ai/resumeAnalyzer.js';

describe('Hybrid ATS Scoring Engine Tests', () => {
  const sampleRawResume = `
Alex Chen
San Francisco, CA • alex.chen@example.com • +1 (555) 382-9104
LinkedIn: linkedin.com/in/alexchen-dev • GitHub: github.com/alexchen-dev

SUMMARY
Software engineer with hands-on experience building performant full-stack applications in TypeScript, React, and Node.js.

EDUCATION
University of California, Berkeley — Bachelor of Science in Computer Science (2022 - 2026) | GPA: 3.85

SKILLS
Languages & Frameworks: JavaScript, TypeScript, Python, React, Node.js, Express, PostgreSQL, Tailwind CSS
Tools: Git, GitHub, Docker, Postman, Linux

WORK EXPERIENCE
NovaTech — Software Engineering Intern (Jun 2024 - Aug 2024)
• Engineered 8 RESTful microservices in Node.js and PostgreSQL reducing latency by 32%.
• Built responsive client dashboard in React for 12,000+ daily active users.
• Elevated automated test coverage from 58% to 86% using Vitest.

PROJECTS
CloudScale — Distributed Metrics & Observability (React, TypeScript, Node.js, Docker)
• Architected real-time streaming telemetry dashboard handling 50,000+ events/sec with sub-50ms latency.
• Accelerated PostgreSQL query performance by 45% through composite indexing.
  `.trim();

  it('should parse resume text into structured sections accurately', () => {
    const structured = parseResumeTextToStructured(sampleRawResume);

    expect(structured.personal.name).toBe('Alex Chen');
    expect(structured.personal.email).toBe('alex.chen@example.com');
    expect(structured.personal.phone).toBe('+1 (555) 382-9104');
    expect(structured.personal.linkedin).toContain('linkedin.com/in/alexchen-dev');
    expect(structured.personal.github).toContain('github.com/alexchen-dev');
    expect(structured.skills.technical.length).toBeGreaterThanOrEqual(4);
    expect(structured.experience.length).toBeGreaterThan(0);
    expect(structured.projects.length).toBeGreaterThan(0);
  });

  it('should calculate realistic deterministic ATS score with category breakdown', async () => {
    const structured = parseResumeTextToStructured(sampleRawResume);
    const result = await analyzeResume(structured, sampleRawResume);

    expect(result.atsScore).toBeGreaterThanOrEqual(75);
    expect(result.atsScore).toBeLessThanOrEqual(100);

    // Verify category scores
    expect(result.categoryScores.atsCompatibility).toBeGreaterThan(70);
    expect(result.categoryScores.skills).toBeGreaterThan(70);
    expect(result.categoryScores.projects).toBeGreaterThan(70);
    expect(result.categoryScores.experience).toBeGreaterThan(70);

    // Verify strengths and weaknesses
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.keywordAnalysis.actionVerbsCount).toBeGreaterThanOrEqual(3);
    expect(result.keywordAnalysis.measurableMetricsCount).toBeGreaterThanOrEqual(2);
    expect(result.deterministicMetrics.wordCount).toBeGreaterThan(50);
  });
});
