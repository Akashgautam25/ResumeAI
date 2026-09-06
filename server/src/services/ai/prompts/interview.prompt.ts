export function buildInterviewPrompt(resumeText: string, jobText?: string): string {
  return `You are a Principal Engineering Lead conducting a technical and behavioral interview.
Generate realistic, high-signal interview questions tailored to the candidate's actual projects, skills, and target role.

RESUME CONTENT:
${resumeText.slice(0, 3500)}

${jobText ? `TARGET JOB DESCRIPTION:\n${jobText.slice(0, 2000)}\n` : ''}

Generate 8 to 12 questions spanning:
- Technical Questions (deep dives into technologies candidate claimed)
- Project Architecture & Trade-offs (based specifically on candidate's listed projects)
- Behavioral Questions (using the STAR framework - Situation, Task, Action, Result)
- Situational / HR Questions (collaboration, deadlines, engineering challenges)

For each question:
- Explain WHY the interviewer asks this question.
- Provide a structured answer framework with bullet points.
- Include a sample high-performing answer outline.

Respond ONLY with raw JSON:
{
  "readinessScore": 78,
  "categoryScores": {
    "technical": 82,
    "projects": 75,
    "behavioral": 81,
    "communication": 74
  },
  "questions": [
    {
      "category": "Technical",
      "question": "How did you manage state and optimize rendering performance in your React applications?",
      "difficulty": "Medium",
      "whyItMatters": "Evaluates understanding of React virtual DOM, memoization (useMemo, useCallback), and re-render lifecycle.",
      "suggestedAnswerFramework": "1. Mention state strategy (Context vs Zustand/Redux). 2. Explain profiling tools (React DevTools). 3. Provide concrete example of optimizing heavy components.",
      "sampleAnswer": "In my projects, I localized state to prevent unnecessary top-level re-renders. For expensive computations, I utilized useMemo and wrapped stable callbacks with useCallback, reducing render cycles by over 30%."
    }
  ]
}`;
}
