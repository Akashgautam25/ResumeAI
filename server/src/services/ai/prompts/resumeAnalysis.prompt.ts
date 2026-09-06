export function buildResumeAnalysisPrompt(resumeText: string, structuredJson: string): string {
  return `You are a Principal Technical Recruiter and Senior Engineering Hiring Manager at a top-tier tech company.
Analyze the following resume thoroughly.

CRITICAL RULES:
1. Provide realistic, constructive, and highly actionable feedback.
2. Evaluate based on ATS parsing fidelity, technical depth, quantifiable impact, action verbs, and structure.
3. Categorize weaknesses strictly by severity: 'Critical', 'High', 'Medium', or 'Low'.
4. NEVER advise fabricating false metrics, companies, titles, or certifications.
5. Provide a valid JSON response matching the required schema exactly.

Resume Plain Text:
${resumeText.slice(0, 4000)}

Structured JSON:
${structuredJson.slice(0, 3000)}

Respond with ONLY a raw JSON object (no markdown, no backticks, no preamble) matching this schema:
{
  "qualitativeScores": {
    "summaryQuality": 85,
    "impactClarity": 80,
    "technicalDepth": 88,
    "relevance": 82,
    "professionalism": 90
  },
  "strengths": [
    {
      "title": "Clear Technical Stack Coverage",
      "explanation": "Your technical skills are well organized and relevant to modern software development roles.",
      "category": "Skills"
    }
  ],
  "weaknesses": [
    {
      "title": "Lack of Quantifiable Metrics in Projects",
      "explanation": "Several project bullets describe what was built but lack performance metrics, user counts, or optimization figures.",
      "severity": "High",
      "recommendation": "Add specific metrics where factually true, such as latency reduction, active users, test coverage %, or data scale.",
      "category": "Impact"
    }
  ],
  "sectionImprovements": [
    {
      "section": "summary",
      "originalText": "...",
      "suggestedText": "...",
      "reason": "Replaced generic phrasing with stronger focus on core engineering specializations."
    }
  ],
  "industryKeywordsFound": ["React", "TypeScript", "REST APIs", "Node.js"],
  "industryKeywordsMissing": ["CI/CD", "Docker", "Unit Testing", "System Architecture"]
}`;
}
