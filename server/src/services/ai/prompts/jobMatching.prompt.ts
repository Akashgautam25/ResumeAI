export function buildJobMatchPrompt(resumeText: string, jobText: string): string {
  return `You are an AI Talent Acquisition Strategist.
Compare the user's resume against the target job description and provide a granular matching analysis and tailoring recommendations.

TARGET JOB DESCRIPTION:
${jobText.slice(0, 3000)}

USER RESUME:
${resumeText.slice(0, 3500)}

CRITICAL RULES:
1. Extract true requirements vs preferred qualifications.
2. Identify matched skills, partially matched skills, and completely missing skills.
3. Calculate honest match percentages across overall, skills, experience, education, and keywords.
4. Generate actionable recommendations (e.g. highlight specific existing projects that match requirements, rephrase bullets to emphasize relevant technologies).
5. Suggest tailored bullet improvements ONLY based on actual experiences mentioned in the resume. Never fabricate missing experience.

Respond ONLY with raw JSON:
{
  "parsedJob": {
    "role": "Software Engineer",
    "company": "Tech Corp",
    "requiredSkills": ["React", "TypeScript", "Node.js", "SQL"],
    "preferredSkills": ["AWS", "Docker", "CI/CD", "Redis"],
    "keywords": ["Agile", "REST APIs", "Microservices", "Unit Testing"],
    "minExperienceYears": 2,
    "educationLevel": "Bachelor's in Computer Science or related field"
  },
  "matchScores": {
    "overall": 78,
    "skills": 82,
    "experience": 75,
    "education": 95,
    "keywords": 80
  },
  "skillBreakdown": {
    "matched": ["React", "TypeScript", "Node.js", "REST APIs", "Git"],
    "partial": ["PostgreSQL", "Docker"],
    "missing": ["AWS", "System Design", "CI/CD"]
  },
  "recommendations": [
    {
      "title": "Highlight Docker in Deployment Bullets",
      "advice": "Your resume mentions Docker in skills, but does not demonstrate it in a project bullet. Consider mentioning your containerized setup.",
      "priority": "High"
    }
  ],
  "tailoredImprovements": [
    {
      "section": "Experience / Project",
      "original": "Built a web application for user data.",
      "proposed": "Architected a full-stack web application with React and Node.js REST APIs handling authenticated user workflows.",
      "reason": "Emphasizes full-stack API integration aligned with the job requirement."
    }
  ]
}`;
}
