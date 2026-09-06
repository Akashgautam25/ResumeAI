import { describe, it, expect } from 'vitest';
import { parseResumeTextToStructured } from '../src/services/parser/sectionExtractor.js';
import { matchResumeWithJob } from '../src/services/ai/jobMatcher.js';

describe('Job Matching & Skill Comparison Tests', () => {
  const sampleRawResume = `
Alex Chen
San Francisco, CA • alex.chen@example.com
LinkedIn: linkedin.com/in/alexchen-dev • GitHub: github.com/alexchen-dev

SUMMARY
Software engineer with hands-on experience building performant full-stack applications in TypeScript, React, and Node.js.

SKILLS
Languages & Frameworks: JavaScript, TypeScript, Python, React, Node.js, Express, PostgreSQL, Tailwind CSS, REST APIs
Tools: Git, GitHub, Docker, Postman, Linux

WORK EXPERIENCE
NovaTech — Software Engineering Intern (Jun 2024 - Aug 2024)
• Engineered 8 RESTful microservices in Node.js and PostgreSQL reducing latency by 32%.
• Built responsive client dashboard in React for 12,000+ daily active users.
  `.trim();

  const targetJobText = `
Software Engineer - Full-Stack
Acme Tech is hiring a Full-Stack Software Engineer.
Requirements:
- Strong experience in React, TypeScript, Node.js, and REST APIs.
- Experience with relational databases like PostgreSQL.
- Experience with AWS, Docker, and CI/CD pipelines.
- Knowledge of Git version control.
  `.trim();

  it('should match resume with job description and detect matched and missing skills', async () => {
    const structured = parseResumeTextToStructured(sampleRawResume);
    const result = await matchResumeWithJob(structured, sampleRawResume, targetJobText);

    expect(result.overallScore).toBeGreaterThanOrEqual(70);
    expect(result.skillMatchScore).toBeGreaterThanOrEqual(70);

    // Verify skills detection
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('TypeScript');
    expect(result.matchedSkills).toContain('Node.js');

    // Verify missing skills identification
    expect(result.missingSkills.length).toBeGreaterThan(0);

    // Verify tailored recommendations and diffs
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.tailoredDiffs.length).toBeGreaterThan(0);
  });
});
