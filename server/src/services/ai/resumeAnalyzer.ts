import {
  StructuredResume,
  CategoryScores,
  StrengthItem,
  WeaknessItem,
  ImprovementItem,
  KeywordAnalysis,
  DeterministicMetrics,
} from '../../types/resume.js';
import { callAI } from './aiClient.js';
import { buildResumeAnalysisPrompt } from './prompts/resumeAnalysis.prompt.js';

const STRONG_ACTION_VERBS = new Set([
  'architected', 'accelerated', 'achieved', 'administered', 'analyzed', 'automated', 'authored',
  'built', 'championed', 'collaborated', 'configured', 'constructed', 'coordinated', 'created',
  'customized', 'debugged', 'decreased', 'delivered', 'deployed', 'designed', 'developed',
  'devised', 'directed', 'documented', 'doubled', 'drove', 'engineered', 'enhanced', 'established',
  'evaluated', 'executed', 'expanded', 'expedited', 'formulated', 'generated', 'guided', 'headed',
  'implemented', 'improved', 'increased', 'initiated', 'inspected', 'instituted', 'integrated',
  'introduced', 'invented', 'launched', 'led', 'leveraged', 'maintained', 'managed', 'maximized',
  'mentored', 'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated', 'organized',
  'overhauled', 'oversaw', 'performed', 'pioneered', 'planned', 'produced', 'programmed',
  'published', 'redesigned', 'reduced', 'refactored', 'resolved', 'restructured', 'revamped',
  'saved', 'scaled', 'scheduled', 'secured', 'simplified', 'spearheaded', 'standardized',
  'streamlined', 'strengthened', 'structured', 'surpassed', 'synthesized', 'trained', 'transformed',
  'troubleshot', 'unified', 'upgraded', 'validated', 'yielded'
]);

const WEAK_VERBS = new Set([
  'helped', 'worked', 'assisted', 'tried', 'handled', 'was responsible for', 'did', 'participated',
  'involved with', 'attempted', 'supported', 'learned'
]);

const BUZZWORDS_AND_CLICHES = [
  'hard worker', 'team player', 'think outside the box', 'go-getter', 'self-motivated',
  'detail-oriented', 'results-driven', 'synergy', 'fast learner', 'dynamic professional',
  'rockstar', 'ninja', 'guru', 'passionate individual'
];

export interface FullAnalysisResult {
  atsScore: number;
  categoryScores: CategoryScores;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  improvements: ImprovementItem[];
  keywordAnalysis: KeywordAnalysis;
  deterministicMetrics: DeterministicMetrics;
  rawAiResponse?: string;
}

export async function analyzeResume(
  structured: StructuredResume,
  rawText: string,
  userId?: string
): Promise<FullAnalysisResult> {
  // 1. Run Deterministic Analysis
  const det = runDeterministicAnalysis(structured, rawText);

  // 2. Run AI Analysis (with heuristic fallback)
  const aiResult = await callAI<{
    qualitativeScores?: Record<string, number>;
    strengths?: StrengthItem[];
    weaknesses?: WeaknessItem[];
    sectionImprovements?: ImprovementItem[];
    industryKeywordsFound?: string[];
    industryKeywordsMissing?: string[];
  }>(
    {
      prompt: buildResumeAnalysisPrompt(rawText, JSON.stringify(structured)),
      userId,
      endpointName: 'analyze-resume',
    },
    () => generateDeterministicAiFallback(structured, det)
  );

  // 3. Compute Composite ATS Category Scores
  const categoryScores = computeCategoryScores(det, aiResult?.qualitativeScores);

  // 4. Calculate Overall ATS Score (weighted average)
  const overallAtsScore = Math.round(
    categoryScores.atsCompatibility * 0.15 +
    categoryScores.resumeStructure * 0.10 +
    categoryScores.skills * 0.15 +
    categoryScores.experience * 0.15 +
    categoryScores.projects * 0.15 +
    categoryScores.education * 0.05 +
    categoryScores.achievements * 0.05 +
    categoryScores.keywords * 0.10 +
    categoryScores.impact * 0.05 +
    categoryScores.formatting * 0.05
  );

  // 5. Aggregate Strengths & Weaknesses
  const strengths = mergeStrengths(det.deterministicStrengths, aiResult.strengths || []);
  const weaknesses = mergeWeaknesses(det.deterministicWeaknesses, aiResult.weaknesses || []);

  const improvements: ImprovementItem[] = aiResult.sectionImprovements || [
    {
      section: 'summary',
      originalText: structured.summary || 'Aspiring software developer looking for opportunities.',
      suggestedText: `Dedicated ${structured.personal.title || 'Software Engineer'} with strong proficiency in ${structured.skills.technical.slice(0, 3).join(', ') || 'modern web technologies'}, demonstrated through full-stack development and modular project architecture.`,
      reason: 'Replaces passive wording with active technical competencies and concrete focus areas.',
    },
  ];

  const keywordAnalysis: KeywordAnalysis = {
    totalKeywords: det.totalKeywordsFound,
    topKeywords: det.topKeywords,
    actionVerbsCount: det.actionVerbsCount,
    measurableMetricsCount: det.quantifiedBulletsCount,
    missingKeywords: aiResult.industryKeywordsMissing || ['CI/CD', 'Docker', 'System Architecture', 'Unit Testing'],
  };

  const deterministicMetrics: DeterministicMetrics = {
    bulletCount: det.totalBullets,
    avgBulletLength: det.avgBulletWordCount,
    contactCompleteness: det.contactScore,
    wordCount: det.wordCount,
    readingTimeMin: Math.max(1, Math.round(det.wordCount / 200)),
    actionVerbRatio: det.actionVerbRatio,
    quantifiedBulletRatio: det.quantifiedBulletRatio,
  };

  return {
    atsScore: Math.min(99, Math.max(25, overallAtsScore)),
    categoryScores,
    strengths,
    weaknesses,
    improvements,
    keywordAnalysis,
    deterministicMetrics,
  };
}

interface DeterministicEvaluation {
  contactScore: number;
  structureScore: number;
  skillsScore: number;
  experienceScore: number;
  projectsScore: number;
  educationScore: number;
  achievementsScore: number;
  formattingScore: number;
  wordCount: number;
  totalBullets: number;
  avgBulletWordCount: number;
  actionVerbsCount: number;
  actionVerbRatio: number;
  quantifiedBulletsCount: number;
  quantifiedBulletRatio: number;
  totalKeywordsFound: number;
  topKeywords: string[];
  deterministicStrengths: StrengthItem[];
  deterministicWeaknesses: WeaknessItem[];
}

function runDeterministicAnalysis(structured: StructuredResume, rawText: string): DeterministicEvaluation {
  const strengths: StrengthItem[] = [];
  const weaknesses: WeaknessItem[] = [];

  const words = rawText.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Contact Information
  let contactScore = 40;
  if (structured.personal.name && structured.personal.name !== 'Job Seeker') contactScore += 10;
  if (structured.personal.email) contactScore += 15;
  if (structured.personal.phone) contactScore += 10;
  if (structured.personal.linkedin) {
    contactScore += 15;
    strengths.push({
      title: 'LinkedIn Profile Linked',
      explanation: 'Including a verified LinkedIn URL enhances recruiter trust and profile verification.',
      category: 'ATS Compatibility',
    });
  } else {
    weaknesses.push({
      title: 'Missing LinkedIn Profile',
      explanation: 'A LinkedIn URL is expected by standard corporate ATS systems and technical recruiters.',
      severity: 'Medium',
      recommendation: 'Add your LinkedIn profile link in the contact header.',
      category: 'ATS Compatibility',
    });
  }

  if (structured.personal.github) {
    contactScore += 10;
    strengths.push({
      title: 'GitHub Profile Linked',
      explanation: 'GitHub link allows hiring managers to immediately audit your code quality and repositories.',
      category: 'ATS Compatibility',
    });
  }

  // 2. Structure & Sections
  let structureScore = 50;
  if (structured.summary && structured.summary.length > 40) structureScore += 10;
  if (structured.experience && structured.experience.length > 0) structureScore += 15;
  if (structured.projects && structured.projects.length >= 2) {
    structureScore += 15;
    strengths.push({
      title: 'Strong Project Portfolio',
      explanation: 'Having 2+ detailed projects demonstrates practical, hands-on engineering capabilities.',
      category: 'Projects',
    });
  } else if (!structured.projects || structured.projects.length === 0) {
    weaknesses.push({
      title: 'No Projects Listed',
      explanation: 'Projects are vital proof of technical competence, especially for students and early-career engineers.',
      severity: 'Critical',
      recommendation: 'Add at least 2 full-stack or technical projects with live or repository links.',
      category: 'Projects',
    });
  }

  if (structured.education && structured.education.length > 0) structureScore += 10;

  // 3. Bullet Points, Action Verbs, and Metrics Analysis
  const allBullets: string[] = [];
  structured.experience.forEach((e) => allBullets.push(...(e.highlights || [])));
  structured.projects.forEach((p) => allBullets.push(...(p.highlights || [])));

  const totalBullets = allBullets.length;
  let actionVerbsCount = 0;
  let quantifiedBulletsCount = 0;
  let weakVerbsCount = 0;
  let totalBulletWords = 0;

  const metricRegex = /\b(\d+(\.\d+)?%|\$\d+(\.\d+)?|\d+\s*(users|clients|requests|ms|seconds|minutes|hours|x|fold|stars|downloads|endpoints|tests))\b|\b\d{2,}\b/i;

  for (const bullet of allBullets) {
    const bWords = bullet.trim().split(/\s+/);
    totalBulletWords += bWords.length;

    const firstWord = bWords[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (STRONG_ACTION_VERBS.has(firstWord)) {
      actionVerbsCount++;
    } else if (WEAK_VERBS.has(firstWord)) {
      weakVerbsCount++;
    }

    if (metricRegex.test(bullet)) {
      quantifiedBulletsCount++;
    }
  }

  const avgBulletWordCount = totalBullets > 0 ? Math.round(totalBulletWords / totalBullets) : 0;
  const actionVerbRatio = totalBullets > 0 ? actionVerbsCount / totalBullets : 0;
  const quantifiedBulletRatio = totalBullets > 0 ? quantifiedBulletsCount / totalBullets : 0;

  if (actionVerbRatio >= 0.7) {
    strengths.push({
      title: 'Strong Action Verb Density',
      explanation: `${Math.round(actionVerbRatio * 100)}% of your bullet points start with commanding action verbs.`,
      category: 'Impact',
    });
  } else if (weakVerbsCount > 0 || actionVerbRatio < 0.4) {
    weaknesses.push({
      title: 'Passive or Weak Verb Phrasing',
      explanation: 'Several bullet points start with passive phrases like "assisted with" or "worked on" instead of direct engineering verbs.',
      severity: 'Medium',
      recommendation: 'Replace passive verbs with strong action verbs like "Architected", "Engineered", "Optimized", or "Implemented".',
      category: 'Impact',
    });
  }

  if (quantifiedBulletRatio >= 0.4) {
    strengths.push({
      title: 'Measurable Outcomes Included',
      explanation: `${Math.round(quantifiedBulletRatio * 100)}% of your bullet points contain measurable metrics, percentages, or scale.`,
      category: 'Impact',
    });
  } else {
    weaknesses.push({
      title: 'Bullet Points Lack Measurable Impact',
      explanation: 'Bullets explain responsibilities but rarely mention measurable outcomes or scale (e.g. latency, users, data size).',
      severity: 'High',
      recommendation: 'Add quantifiable metrics where factually accurate (e.g. "Reduced API response times by 35%"). If metrics are unknown, state the scale or number of active components.',
      category: 'Impact',
    });
  }

  // 4. Skills Analysis
  const techSkills = structured.skills.technical || [];
  const tools = structured.skills.tools || [];
  const allSkills = [...techSkills, ...tools];
  let skillsScore = Math.min(95, 45 + allSkills.length * 4);

  if (techSkills.length >= 6) {
    strengths.push({
      title: 'Diverse Technical Stack',
      explanation: `Highlighted ${techSkills.length} core technical competencies covering languages, frameworks, and databases.`,
      category: 'Skills',
    });
  } else {
    weaknesses.push({
      title: 'Low Technical Skill Density',
      explanation: 'Fewer than 6 technical skills were identified. ATS parsers score resumes higher when core tools and languages are clearly listed.',
      severity: 'High',
      recommendation: 'Expand your Technical Skills section to include relevant languages, frameworks, databases, and development tools.',
      category: 'Skills',
    });
  }

  // 5. Buzzword / Cliché Check
  const foundBuzzwords = BUZZWORDS_AND_CLICHES.filter((b) => rawText.toLowerCase().includes(b));
  if (foundBuzzwords.length > 0) {
    weaknesses.push({
      title: 'Generic Buzzwords Detected',
      explanation: `Found generic phrases (${foundBuzzwords.slice(0, 2).join(', ')}) that add no concrete technical value.`,
      severity: 'Low',
      recommendation: 'Replace generic clichés with concrete achievements and technologies.',
      category: 'Formatting',
    });
  }

  // 6. Resume Length Check
  let formattingScore = 85;
  if (wordCount < 150) {
    weaknesses.push({
      title: 'Resume is Too Short',
      explanation: `Total word count is ~${wordCount} words. Standard single-page tech resumes have between 350 to 600 words.`,
      severity: 'High',
      recommendation: 'Flesh out project highlights, technologies used, and education details.',
      category: 'Formatting',
    });
    formattingScore -= 20;
  } else if (wordCount > 900) {
    weaknesses.push({
      title: 'Resume May Exceed 1 Page',
      explanation: `Total word count is ~${wordCount} words. For students and junior engineers, concise 1-page resumes are preferred by recruiters.`,
      severity: 'Low',
      recommendation: 'Condense older or less relevant bullet points to keep formatting crisp.',
      category: 'Formatting',
    });
    formattingScore -= 10;
  }

  return {
    contactScore: Math.min(100, contactScore),
    structureScore: Math.min(100, structureScore),
    skillsScore: Math.min(100, skillsScore),
    experienceScore: structured.experience.length > 0 ? 85 : 60,
    projectsScore: structured.projects.length >= 2 ? 88 : structured.projects.length === 1 ? 70 : 45,
    educationScore: structured.education.length > 0 ? 92 : 60,
    achievementsScore: (structured.achievements?.length || 0) > 0 || (structured.certifications?.length || 0) > 0 ? 85 : 65,
    formattingScore: Math.min(100, formattingScore),
    wordCount,
    totalBullets,
    avgBulletWordCount,
    actionVerbsCount,
    actionVerbRatio,
    quantifiedBulletsCount,
    quantifiedBulletRatio,
    totalKeywordsFound: allSkills.length,
    topKeywords: allSkills.slice(0, 8),
    deterministicStrengths: strengths,
    deterministicWeaknesses: weaknesses,
  };
}

function computeCategoryScores(det: DeterministicEvaluation, aiQualitative?: Record<string, number>): CategoryScores {
  const aiImpact = aiQualitative?.impactClarity ?? 78;
  const aiTechDepth = aiQualitative?.technicalDepth ?? 80;
  const aiSummary = aiQualitative?.summaryQuality ?? 82;

  return {
    atsCompatibility: Math.round(det.contactScore * 0.5 + det.structureScore * 0.5),
    resumeStructure: Math.round(det.structureScore * 0.7 + (aiSummary ? 85 : 70) * 0.3),
    skills: Math.round(det.skillsScore * 0.7 + aiTechDepth * 0.3),
    experience: Math.round(det.experienceScore * 0.6 + aiImpact * 0.4),
    projects: Math.round(det.projectsScore * 0.6 + aiImpact * 0.4),
    education: det.educationScore,
    achievements: det.achievementsScore,
    keywords: Math.min(96, Math.round(det.skillsScore * 0.8 + 15)),
    impact: Math.round((det.quantifiedBulletRatio * 50 + det.actionVerbRatio * 30 + 20) * 0.5 + aiImpact * 0.5),
    formatting: det.formattingScore,
  };
}

function mergeStrengths(deterministic: StrengthItem[], ai: StrengthItem[]): StrengthItem[] {
  const set = new Set<string>();
  const merged: StrengthItem[] = [];

  for (const s of [...deterministic, ...ai]) {
    if (!set.has(s.title.toLowerCase())) {
      set.add(s.title.toLowerCase());
      merged.push(s);
    }
  }

  return merged.slice(0, 6);
}

function mergeWeaknesses(deterministic: WeaknessItem[], ai: WeaknessItem[]): WeaknessItem[] {
  const set = new Set<string>();
  const merged: WeaknessItem[] = [];

  // Prioritize Critical and High
  const all = [...deterministic, ...ai].sort((a, b) => {
    const priority: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (priority[b.severity] || 0) - (priority[a.severity] || 0);
  });

  for (const w of all) {
    if (!set.has(w.title.toLowerCase())) {
      set.add(w.title.toLowerCase());
      merged.push(w);
    }
  }

  return merged.slice(0, 6);
}

function generateDeterministicAiFallback(structured: StructuredResume, det: DeterministicEvaluation) {
  return {
    qualitativeScores: {
      summaryQuality: structured.summary ? 80 : 55,
      impactClarity: Math.round(det.quantifiedBulletRatio * 60 + 35),
      technicalDepth: Math.min(90, 50 + structured.skills.technical.length * 4),
      relevance: 82,
      professionalism: 88,
    },
    strengths: [
      {
        title: 'Clear Technical Vocabulary',
        explanation: 'The resume properly incorporates industry standard technology names and programming languages.',
        category: 'Skills',
      },
      {
        title: 'Organized Section Hierarchy',
        explanation: 'Clear demarcation between education, projects, skills, and work history.',
        category: 'Resume Structure',
      },
    ],
    weaknesses: [
      {
        title: 'Include Specific Metrics in Bullet Points',
        explanation: 'Adding quantifiable indicators (performance % boost, user concurrency, or dataset magnitude) significantly increases ATS scoring.',
        severity: 'High' as const,
        recommendation: 'Update key project bullet points with realistic outcomes if known.',
        category: 'Impact',
      },
    ],
    sectionImprovements: [
      {
        section: 'summary',
        originalText: structured.summary || 'Software engineering student with project experience.',
        suggestedText: `Results-driven ${structured.personal.title || 'Software Engineer'} experienced in ${structured.skills.technical.slice(0, 3).join(', ') || 'full-stack web development'}, dedicated to building scalable and responsive applications.`,
        reason: 'Adds direct professional identity and front-loads technical proficiencies.',
      },
    ],
    industryKeywordsFound: structured.skills.technical.slice(0, 6),
    industryKeywordsMissing: ['CI/CD Pipeline', 'Docker Containers', 'Microservices', 'Automated Testing'],
  };
}
