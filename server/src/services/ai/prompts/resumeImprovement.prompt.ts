export function buildResumeImprovementPrompt(
  type: 'summary' | 'bullet' | 'project' | 'general',
  originalText: string,
  context?: string,
  goal?: string
): string {
  return `You are an elite career coach and executive resume writer for tech roles.
Improve the following resume content.

TYPE: ${type.toUpperCase()}
ORIGINAL CONTENT:
"${originalText}"

${context ? `CONTEXT / SURROUNDING INFO:\n${context}\n` : ''}
${goal ? `USER GOAL: ${goal}\n` : ''}

CRITICAL RULES:
1. STRICTLY PRESERVE FACTUAL ACCURACY. Do NOT invent fake metrics, tools, employers, or accomplishments.
2. If a metric is missing, use placeholders in brackets like "[reduced load time by X%]" or suggest where the user can plug in their own factual number.
3. Start bullet points with strong, varied action verbs (e.g., Engineered, Architected, Spearheaded, Optimized, Streamlined, Orchestrated).
4. Remove passive voice, filler words, buzzwords, and vague adjectives.
5. Provide 3 distinct high-impact variations with clear rationales.

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "improved": "Primary best improvement text",
  "reason": "Clear explanation of why this version is stronger (e.g. stronger active verb, tighter phrasing, clear cause-and-effect)",
  "variations": [
    {
      "text": "Variation 1: High Impact & Metrics focused",
      "style": "Impact-driven",
      "note": "Best for highlighting outcomes and scalability"
    },
    {
      "text": "Variation 2: Technical Depth focused",
      "style": "Technical",
      "note": "Best for highlighting architecture and tooling"
    },
    {
      "text": "Variation 3: Concise & Direct",
      "style": "Concise",
      "note": "Best for tight single-line spacing"
    }
  ],
  "actionVerbsUsed": ["Engineered", "Optimized", "Architected"]
}`;
}
