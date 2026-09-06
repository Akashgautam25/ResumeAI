export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  targetRole?: string;
  experienceLevel?: string;
  preferredIndustry?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  createdAt?: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  title?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  location?: string;
  achievements?: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  link?: string;
  githubUrl?: string;
  highlights: string[];
}

export interface SkillsData {
  technical: string[];
  tools: string[];
  softSkills: string[];
  languages?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface StructuredResume {
  personal: PersonalInfo;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillsData;
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  leadership?: string[];
  extracurricular?: string[];
}

export interface CategoryScores {
  atsCompatibility: number;
  resumeStructure: number;
  skills: number;
  experience: number;
  projects: number;
  education: number;
  achievements: number;
  keywords: number;
  impact: number;
  formatting: number;
}

export interface StrengthItem {
  title: string;
  explanation: string;
  category: string;
}

export interface WeaknessItem {
  title: string;
  explanation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
  category: string;
}

export interface ImprovementItem {
  section: string;
  originalText: string;
  suggestedText: string;
  reason: string;
}

export interface KeywordAnalysis {
  totalKeywords: number;
  topKeywords: string[];
  actionVerbsCount: number;
  measurableMetricsCount: number;
  missingKeywords: string[];
}

export interface DeterministicMetrics {
  bulletCount: number;
  avgBulletLength: number;
  contactCompleteness: number;
  wordCount: number;
  readingTimeMin: number;
  actionVerbRatio: number;
  quantifiedBulletRatio: number;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  atsScore: number;
  categoryScores: CategoryScores;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  improvements: ImprovementItem[];
  keywordAnalysis: KeywordAnalysis;
  deterministicMetrics: DeterministicMetrics;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  targetRole?: string;
  templateId: string;
  rawText?: string;
  structuredData: StructuredResume;
  atsScore: number;
  completenessScore: number;
  isBase?: boolean;
  versionCount?: number;
  jobMatchCount?: number;
  interviewCount?: number;
  lastAnalysisDate?: string;
  latestAnalysis?: ResumeAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionNumber: number;
  title: string;
  templateId: string;
  structuredData: StructuredResume;
  atsScore: number;
  changeSummary?: string;
  createdAt: string;
}

export interface ParsedJobData {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  responsibilities: string[];
  keywords: string[];
  minExperienceYears: number;
  educationLevel: string;
}

export interface RecommendationItem {
  title: string;
  advice: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface TailoredDiffItem {
  section: string;
  original: string;
  proposed: string;
  reason: string;
}

export interface JobMatch {
  id: string;
  resumeId: string;
  jobId: string;
  overallScore: number;
  skillMatchScore: number;
  expMatchScore: number;
  eduMatchScore: number;
  keywordMatchScore: number;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  recommendations: RecommendationItem[];
  tailoredDiffs?: TailoredDiffItem[];
  parsedJob?: ParsedJobData;
  createdAt: string;
}

export interface JobDescription {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  rawText: string;
  parsedData?: ParsedJobData;
  latestMatch?: {
    id: string;
    resumeId: string;
    overallScore: number;
    skillMatchScore: number;
    createdAt: string;
  };
  matches?: JobMatch[];
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  category: 'Technical' | 'Project' | 'Behavioral' | 'HR';
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  whyItMatters: string;
  suggestedAnswerFramework: string;
  sampleAnswer?: string;
  userNotes?: string;
  order: number;
}

export interface InterviewSession {
  id: string;
  resumeId: string;
  resumeTitle?: string;
  jobId?: string;
  targetRole: string;
  targetCompany?: string;
  readinessScore: number;
  categoryScores: {
    technical: number;
    projects: number;
    behavioral: number;
    communication: number;
  };
  questionCount?: number;
  questions?: InterviewQuestion[];
  createdAt: string;
}
