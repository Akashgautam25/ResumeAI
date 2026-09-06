import { StructuredResume } from '../../types/resume.js';
import { callAI } from './aiClient.js';
import { buildInterviewPrompt } from './prompts/interview.prompt.js';

export interface GeneratedQuestion {
  category: 'Technical' | 'Project' | 'Behavioral' | 'HR';
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  whyItMatters: string;
  suggestedAnswerFramework: string;
  sampleAnswer: string;
}

export interface InterviewGenerationResult {
  readinessScore: number;
  categoryScores: {
    technical: number;
    projects: number;
    behavioral: number;
    communication: number;
  };
  questions: GeneratedQuestion[];
}

export async function generateInterviewQuestions(
  resume: StructuredResume,
  rawResumeText: string,
  rawJobText?: string,
  userId?: string
): Promise<InterviewGenerationResult> {
  return callAI<InterviewGenerationResult>(
    {
      prompt: buildInterviewPrompt(rawResumeText, rawJobText),
      userId,
      endpointName: 'interview-questions',
    },
    () => generateDeterministicInterviewFallback(resume)
  );
}

function generateDeterministicInterviewFallback(resume: StructuredResume): InterviewGenerationResult {
  const topSkills = resume.skills.technical.slice(0, 3);
  const primarySkill = topSkills[0] || 'React';
  const secondarySkill = topSkills[1] || 'Node.js';
  const primaryProject = resume.projects[0]?.name || 'Full-Stack Web App';

  const questions: GeneratedQuestion[] = [
    {
      category: 'Technical',
      question: `How do you handle asynchronous operations, error states, and lifecycle management when building applications with ${primarySkill}?`,
      difficulty: 'Medium',
      whyItMatters: `Assesses deep understanding of runtime behavior, concurrency, and graceful error handling in ${primarySkill}.`,
      suggestedAnswerFramework: `1. Explain the async mechanism (Promises/async-await or hooks/effects). 2. Describe error boundary and retry strategies. 3. Cite a real debugging example from your past work.`,
      sampleAnswer: `In my projects with ${primarySkill}, I encapsulate API calls within custom hooks or services utilizing async/await with try/catch blocks. I implement centralized error state handling and fallback UI boundaries so transient network errors don't crash the entire view.`,
    },
    {
      category: 'Technical',
      question: `What architectural considerations do you take into account when designing database schemas and RESTful APIs in ${secondarySkill}?`,
      difficulty: 'Medium',
      whyItMatters: 'Tests candidate ability to model data relationships, avoid N+1 query bottlenecks, and follow RESTful resource conventions.',
      suggestedAnswerFramework: '1. Outline entity normalization vs indexing for read performance. 2. Discuss payload validation and status codes. 3. Mention caching or pagination.',
      sampleAnswer: 'I start by defining normalized models with explicit foreign keys and indexing frequently filtered columns. On the API level, I enforce strict input validation with Zod and implement cursor/offset pagination to ensure responses stay sub-100ms even as dataset size scales.',
    },
    {
      category: 'Project',
      question: `Walk me through the architecture of "${primaryProject}". What was the biggest technical bottleneck you faced and how did you resolve it?`,
      difficulty: 'Hard',
      whyItMatters: 'Tests hands-on problem solving, trade-off evaluation, and authentic engineering ownership.',
      suggestedAnswerFramework: '1. Brief 30-second high-level system overview. 2. The specific bottleneck (e.g., latency, state desync, concurrency). 3. The technical solution and measurable outcome.',
      sampleAnswer: `For "${primaryProject}", the core architecture separated the client UI from the backend services. The biggest challenge was optimizing search querying across multiple relations. I resolved it by implementing debounced queries, indexing foreign keys, and caching frequent queries, which reduced response times by ~40%.`,
    },
    {
      category: 'Behavioral',
      question: 'Tell me about a time you received critical feedback during a code review or project milestone. How did you handle it?',
      difficulty: 'Medium',
      whyItMatters: 'Evaluates emotional intelligence, receptiveness to critique, and continuous technical growth.',
      suggestedAnswerFramework: 'Use STAR: Situation (context of review) -> Task (what was requested) -> Action (how you adapted with curiosity) -> Result (improved code quality or team standard).',
      sampleAnswer: 'During a peer review, a senior engineer pointed out that my component had redundant state variables that could cause synchronization bugs. Instead of defending it, I asked questions to understand best practices, refactored using derived state, and documented the pattern for the team.',
    },
    {
      category: 'Behavioral',
      question: 'Describe a situation where a deadline was tight or requirements changed unexpectedly. How did you prioritize your deliverables?',
      difficulty: 'Medium',
      whyItMatters: 'Measures time management, pragmatism, and cross-functional communication under pressure.',
      suggestedAnswerFramework: '1. Situation: Scope change or imminent deadline. 2. Task: Triage features into P0 (must-have) vs P1 (nice-to-have). 3. Action: Proactive stakeholder communication. 4. Result: On-time delivery of core features.',
      sampleAnswer: 'When a project deadline was accelerated by a week, I broke down the remaining backlog, identified the critical MVP user paths, and aligned with teammates to defer non-essential cosmetic features until the next sprint, successfully shipping the primary user flow on time with zero regressions.',
    },
    {
      category: 'HR',
      question: 'Why are you interested in this software engineering role, and what are you looking for in your next engineering environment?',
      difficulty: 'Easy',
      whyItMatters: 'Assesses culture fit, career vision, and alignment with modern software engineering practices.',
      suggestedAnswerFramework: '1. Connect your interest in technical growth with the company mission. 2. Emphasize excitement for collaborative problem solving. 3. Reiterate your value proposition.',
      sampleAnswer: 'I am looking for a team that values clean architecture, code quality, and engineering ownership. Having built full-stack applications end-to-end, I am excited to contribute to high-impact products while learning alongside talented engineers.',
    },
  ];

  return {
    readinessScore: 78,
    categoryScores: {
      technical: 82,
      projects: 75,
      behavioral: 81,
      communication: 74,
    },
    questions,
  };
}
