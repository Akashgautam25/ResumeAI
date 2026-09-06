import { callAI } from './aiClient.js';
import { buildResumeImprovementPrompt } from './prompts/resumeImprovement.prompt.js';

export interface ImprovementResult {
  improved: string;
  reason: string;
  variations: Array<{
    text: string;
    style: string;
    note: string;
  }>;
  actionVerbsUsed: string[];
}

export async function improveResumeSection(
  type: 'summary' | 'bullet' | 'project' | 'general',
  originalText: string,
  context?: string,
  goal?: string,
  userId?: string
): Promise<ImprovementResult> {
  const prompt = buildResumeImprovementPrompt(type, originalText, context, goal);

  return callAI<ImprovementResult>(
    {
      prompt,
      userId,
      endpointName: `improve-${type}`,
    },
    () => generateDeterministicImprovementFallback(type, originalText)
  );
}

function generateDeterministicImprovementFallback(
  type: 'summary' | 'bullet' | 'project' | 'general',
  originalText: string
): ImprovementResult {
  const clean = originalText.replace(/^[•\-*·]\s*/, '').trim();

  if (type === 'summary') {
    return {
      improved: `Results-driven software engineer skilled in building responsive frontend interfaces and scalable backend services. Proven track record in developing full-stack applications with modern frameworks and robust database architectures.`,
      reason: 'Replaces passive language with active technical competencies and emphasizes tangible engineering capability.',
      variations: [
        {
          text: `Performance-focused software developer experienced in full-stack web applications, clean architecture, and API integration.`,
          style: 'Technical Focus',
          note: 'Highlights architecture and backend integration',
        },
        {
          text: `Software Engineer specializing in React, Node.js, and TypeScript, with a passion for designing scalable software and intuitive user experiences.`,
          style: 'Stack Specific',
          note: 'Front-loads primary technologies for ATS matching',
        },
        {
          text: `Detail-oriented engineer adept at modernizing web systems, improving test coverage, and optimizing end-to-end user workflows.`,
          style: 'Impact Driven',
          note: 'Emphasizes code quality and workflow optimization',
        },
      ],
      actionVerbsUsed: ['Architected', 'Engineered', 'Optimized'],
    };
  }

  // Bullet point improvement fallback
  const firstWord = clean.split(' ')[0] || '';
  const improvedBullet = clean.replace(/^(built|made|worked on|helped with|did|created|assisted in)/i, 'Architected and deployed');

  return {
    improved: `${improvedBullet}, enhancing application responsiveness and code maintainability.`,
    reason: 'Starts with a commanding engineering verb and articulates the system-level outcome.',
    variations: [
      {
        text: `Engineered ${clean.toLowerCase()}, reducing latency and streamlining data retrieval pipelines.`,
        style: 'Performance Driven',
        note: 'Best for backend and optimization work',
      },
      {
        text: `Spearheaded development of ${clean.toLowerCase()} utilizing modular component architecture and automated tests.`,
        style: 'Leadership & Quality',
        note: 'Highlights engineering standards and ownership',
      },
      {
        text: `Developed and launched ${clean.toLowerCase()} with comprehensive REST API integration and error handling.`,
        style: 'Concise',
        note: 'Fits well in single-line bullet constraints',
      },
    ],
    actionVerbsUsed: ['Engineered', 'Architected', 'Spearheaded'],
  };
}
