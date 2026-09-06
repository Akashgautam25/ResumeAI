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
