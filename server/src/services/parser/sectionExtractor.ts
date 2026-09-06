import {
  StructuredResume,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  SkillsData,
  CertificationItem,
  AchievementItem,
} from '../../types/resume.js';

const TECHNICAL_SKILLS_DICTIONARY = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'html', 'css', 'html5', 'css3', 'sass', 'scss', 'tailwindcss', 'tailwind', 'bootstrap', 'material-ui', 'styled-components',
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'vue', 'vue.js', 'vuejs', 'angular', 'svelte', 'express', 'express.js',
  'node', 'node.js', 'nodejs', 'fastapi', 'flask', 'django', 'spring', 'spring boot', 'graphql', 'rest api', 'rest apis',
  'postgresql', 'postgres', 'mysql', 'sqlite', 'mongodb', 'redis', 'prisma', 'typeorm', 'sequelize', 'cassandra', 'elasticsearch',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ci/cd', 'github actions', 'jenkins',
  'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'nlp', 'computer vision', 'pandas', 'numpy',
  'data structures', 'algorithms', 'system design', 'microservices', 'distributed systems', 'linux', 'bash', 'zsh', 'git'
]);

const TOOLS_DICTIONARY = new Set([
  'git', 'github', 'gitlab', 'bitbucket', 'docker', 'postman', 'vs code', 'vscode', 'intellij', 'pycharm', 'vim', 'neovim',
  'figma', 'jira', 'confluence', 'trello', 'notion', 'slack', 'linear', 'webpack', 'vite', 'npm', 'yarn', 'pnpm', 'pip',
  'docker compose', 'nginx', 'apache', 'cloudflare', 'vercel', 'netlify', 'render', 'railway', 'heroku', 'aws cli'
]);

const SOFT_SKILLS_DICTIONARY = new Set([
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving', 'critical thinking', 'agile', 'scrum',
  'time management', 'adaptability', 'mentorship', 'cross-functional collaboration', 'analytical thinking', 'ownership'
]);

export function parseResumeTextToStructured(text: string): StructuredResume {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // 1. Extract Personal Info
  const personal = extractPersonalInfo(text, lines);

  // 2. Identify Section Boundaries
  const sections = splitIntoSections(lines);

  // 3. Extract Summary
  const summary = extractSummary(sections);

  // 4. Extract Skills
  const skills = extractSkills(sections, text);

  // 5. Extract Experience
  const experience = extractExperience(sections);

  // 6. Extract Education
  const education = extractEducation(sections);

  // 7. Extract Projects
  const projects = extractProjects(sections);

  // 8. Extract Certifications
  const certifications = extractCertifications(sections);

  // 9. Extract Achievements
  const achievements = extractAchievements(sections);

  return {
    personal,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
    leadership: [],
    extracurricular: [],
  };
}

function extractPersonalInfo(text: string, lines: string[]) {
  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : '';

  // Portfolio
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:dev|me|io|com|org|app)(?:\/[^\s]*)?/i);
  let portfolio = '';
  if (portfolioMatch && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')) {
    portfolio = portfolioMatch[0];
  }

  // Name (heuristic: first line that isn't an email, phone, or link)
  let name = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      !line.includes('@') &&
      !line.match(/\d{3}/) &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      line.length > 2 &&
      line.length < 50
    ) {
      name = line.replace(/[^\w\s.-]/g, '').trim();
      break;
    }
  }

  // Location heuristic
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/);
  const location = locationMatch ? locationMatch[0].trim() : '';

  return {
    name: name || 'Job Seeker',
    email,
    phone,
    location,
    linkedin,
    github,
    portfolio,
    title: 'Software Engineer',
  };
}

interface SectionMap {
  [sectionName: string]: string[];
}

function splitIntoSections(lines: string[]): SectionMap {
  const sections: SectionMap = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    other: [],
  };

  const sectionKeywords: Record<string, RegExp> = {
    summary: /^(summary|professional summary|executive summary|about me|profile|objective|career objective)$/i,
    experience: /^(experience|work experience|employment|work history|professional experience|internships)$/i,
    education: /^(education|academic background|academics|educational background|qualifications)$/i,
    projects: /^(projects|academic projects|personal projects|key projects|selected projects)$/i,
    skills: /^(skills|technical skills|skills & expertise|core competencies|technologies|tools & technologies)$/i,
    certifications: /^(certifications|licenses|courses & certifications|certificates)$/i,
    achievements: /^(achievements|awards|honors & awards|accomplishments)$/i,
  };

  let currentSection = 'header';

  for (const line of lines) {
    const cleanLine = line.replace(/[:_#-]/g, '').trim();
    let matchedSection: string | null = null;

    for (const [secName, regex] of Object.entries(sectionKeywords)) {
      if (regex.test(cleanLine)) {
        matchedSection = secName;
        break;
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
    } else {
      if (sections[currentSection]) {
        sections[currentSection].push(line);
      } else {
        sections.other.push(line);
      }
    }
  }

  return sections;
}

function extractSummary(sections: SectionMap): string {
  if (sections.summary && sections.summary.length > 0) {
    return sections.summary.join(' ').trim();
  }
  return '';
}

function extractSkills(sections: SectionMap, fullText: string): SkillsData {
  const technical: Set<string> = new Set();
  const tools: Set<string> = new Set();
  const softSkills: Set<string> = new Set();

  const skillLines = sections.skills || [];
  const combinedText = (skillLines.join(' ') + ' ' + fullText).toLowerCase();

  // Scan against dictionary
  for (const tech of TECHNICAL_SKILLS_DICTIONARY) {
    const regex = new RegExp(`\\b${escapeRegex(tech)}\\b`, 'i');
    if (regex.test(combinedText)) {
      technical.add(formatSkillName(tech));
    }
  }

  for (const tool of TOOLS_DICTIONARY) {
    const regex = new RegExp(`\\b${escapeRegex(tool)}\\b`, 'i');
    if (regex.test(combinedText)) {
      tools.add(formatSkillName(tool));
    }
  }

  for (const soft of SOFT_SKILLS_DICTIONARY) {
    const regex = new RegExp(`\\b${escapeRegex(soft)}\\b`, 'i');
    if (regex.test(combinedText)) {
      softSkills.add(formatSkillName(soft));
    }
  }

  // Parse skill lines directly if formatted as "Category: Skill1, Skill2"
  for (const line of skillLines) {
    const parts = line.split(/[,|•;·\n]/).map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const clean = part.replace(/^[-*•]\s*/, '').replace(/^[A-Za-z\s]+:\s*/, '').trim();
      if (clean.length > 1 && clean.length < 30) {
        const lower = clean.toLowerCase();
        if (TOOLS_DICTIONARY.has(lower)) {
          tools.add(formatSkillName(clean));
        } else if (SOFT_SKILLS_DICTIONARY.has(lower)) {
          softSkills.add(formatSkillName(clean));
        } else if (clean.length <= 25) {
          technical.add(formatSkillName(clean));
        }
      }
    }
  }

  return {
    technical: Array.from(technical),
    tools: Array.from(tools),
    softSkills: Array.from(softSkills),
    languages: ['English'],
  };
}

function extractExperience(sections: SectionMap): ExperienceItem[] {
  const lines = sections.experience || [];
  if (lines.length === 0) return [];

  const items: ExperienceItem[] = [];
  let currentItem: Partial<ExperienceItem> | null = null;
  let currentHighlights: string[] = [];

  for (const line of lines) {
    const isBullet = /^[•\-*·]\s*/.test(line);
    const dateMatch = line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\s*[-–—to\s]+\s*(Present|Current|[0-9]{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);

    if (!isBullet && (dateMatch || line.includes('|') || line.toUpperCase() === line || line.length < 60)) {
      // Possible new experience header
      if (currentItem && (currentItem.company || currentItem.position)) {
        items.push({
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          company: currentItem.company || 'Company',
          position: currentItem.position || 'Software Engineer',
          location: currentItem.location || '',
          startDate: currentItem.startDate || '2023',
          endDate: currentItem.endDate || 'Present',
          current: currentItem.current || false,
          highlights: currentHighlights.length > 0 ? currentHighlights : ['Contributed to key software engineering initiatives and development lifecycle.'],
        });
        currentHighlights = [];
      }

      const parts = line.split(/[|–—,-]/).map((p) => p.trim());
      currentItem = {
        company: parts[0] || 'Company',
        position: parts[1] || 'Software Engineer',
        startDate: dateMatch ? dateMatch[1] : '2023',
        endDate: dateMatch ? dateMatch[2] : 'Present',
        current: line.toLowerCase().includes('present') || line.toLowerCase().includes('current'),
      };
    } else {
      const cleanBullet = line.replace(/^[•\-*·]\s*/, '').trim();
      if (cleanBullet) {
        currentHighlights.push(cleanBullet);
      }
    }
  }

  if (currentItem && (currentItem.company || currentItem.position)) {
    items.push({
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      company: currentItem.company || 'Company',
      position: currentItem.position || 'Software Engineer',
      location: currentItem.location || '',
      startDate: currentItem.startDate || '2023',
      endDate: currentItem.endDate || 'Present',
      current: currentItem.current || false,
      highlights: currentHighlights.length > 0 ? currentHighlights : ['Collaborated on feature development and system optimization.'],
    });
  }

  return items;
}

function extractEducation(sections: SectionMap): EducationItem[] {
  const lines = sections.education || [];
  if (lines.length === 0) return [];

  const items: EducationItem[] = [];
  let currentItem: Partial<EducationItem> | null = null;

  for (const line of lines) {
    const isDegree = /(Bachelor|Master|B\.S\.|B\.A\.|M\.S\.|B\.Tech|M\.Tech|Ph\.D|Associate|Diploma|Degree)/i.test(line);
    const isInstitution = /(University|College|Institute|School|Academy)/i.test(line);
    const dateMatch = line.match(/(19|20)\d{2}\s*[-–—to\s]+\s*(19|20\d{2}|Present|Expected\s*\d{4})/i);

    if (isDegree || isInstitution) {
      if (currentItem && (currentItem.institution || currentItem.degree)) {
        items.push({
          id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          institution: currentItem.institution || 'University',
          degree: currentItem.degree || 'Bachelor of Science',
          fieldOfStudy: currentItem.fieldOfStudy || 'Computer Science',
          startDate: currentItem.startDate || '2020',
          endDate: currentItem.endDate || '2024',
          current: currentItem.current || false,
          gpa: currentItem.gpa || '',
        });
      }

      currentItem = {
        institution: isInstitution ? line : 'University',
        degree: isDegree ? line : 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2020',
        endDate: '2024',
        current: false,
      };

      if (dateMatch) {
        currentItem.startDate = dateMatch[1];
        currentItem.endDate = dateMatch[2];
      }
    } else if (currentItem) {
      if (line.toLowerCase().includes('gpa') || line.toLowerCase().includes('cgpa')) {
        const gpaMatch = line.match(/(?:GPA|CGPA)[:\s]*([0-9.]+)(?:\s*\/\s*([0-9.]+))?/i);
        if (gpaMatch) {
          currentItem.gpa = gpaMatch[1] + (gpaMatch[2] ? `/${gpaMatch[2]}` : '/4.0');
        }
      }
    }
  }

  if (currentItem && (currentItem.institution || currentItem.degree)) {
    items.push({
      id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution: currentItem.institution || 'University',
      degree: currentItem.degree || 'Bachelor of Science',
      fieldOfStudy: currentItem.fieldOfStudy || 'Computer Science',
      startDate: currentItem.startDate || '2020',
      endDate: currentItem.endDate || '2024',
      current: currentItem.current || false,
      gpa: currentItem.gpa || '',
    });
  }

  return items;
}

function extractProjects(sections: SectionMap): ProjectItem[] {
  const lines = sections.projects || [];
  if (lines.length === 0) return [];

  const items: ProjectItem[] = [];
  let currentProject: Partial<ProjectItem> | null = null;
  let currentHighlights: string[] = [];

  for (const line of lines) {
    const isBullet = /^[•\-*·]\s*/.test(line);

    if (!isBullet && line.length < 120 && !line.toLowerCase().startsWith('technologies:')) {
      if (currentProject && currentProject.name) {
        items.push({
          id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: currentProject.name,
          role: currentProject.role || 'Lead Developer',
          description: currentProject.description || '',
          technologies: currentProject.technologies || ['React', 'Node.js', 'TypeScript'],
          link: currentProject.link || '',
          githubUrl: currentProject.githubUrl || '',
          highlights: currentHighlights.length > 0 ? currentHighlights : ['Built full-stack application with scalable modular architecture.'],
        });
        currentHighlights = [];
      }

      // Check if line contains (Tech, Stack)
      const techMatch = line.match(/\(([^)]+)\)/);
      const parsedTech = techMatch ? techMatch[1].split(/[,|]/).map((t) => t.trim()).filter(Boolean) : ['React', 'Node.js', 'PostgreSQL'];
      const cleanName = line.replace(/\([^)]+\)/, '').replace(/[:|–—-].*$/, '').trim();

      currentProject = {
        name: cleanName || line.trim(),
        technologies: parsedTech,
        description: '',
      };
    } else {
      const cleanBullet = line.replace(/^[•\-*·]\s*/, '').trim();
      if (cleanBullet) {
        currentHighlights.push(cleanBullet);
      }
    }
  }

  if (currentProject && currentProject.name) {
    items.push({
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: currentProject.name,
      role: currentProject.role || 'Lead Developer',
      description: currentProject.description || '',
      technologies: currentProject.technologies || ['React', 'Node.js', 'PostgreSQL'],
      link: currentProject.link || '',
      githubUrl: currentProject.githubUrl || '',
      highlights: currentHighlights.length > 0 ? currentHighlights : ['Developed robust features and optimized performance.'],
    });
  }

  return items;
}

function extractCertifications(sections: SectionMap): CertificationItem[] {
  const lines = sections.certifications || [];
  return lines.map((line, idx) => ({
    id: `cert-${idx + 1}`,
    name: line.replace(/^[•\-*·]\s*/, '').trim(),
    issuer: 'Professional Organization',
    issueDate: '2024',
  }));
}

function extractAchievements(sections: SectionMap): AchievementItem[] {
  const lines = sections.achievements || [];
  return lines.map((line, idx) => ({
    id: `achieve-${idx + 1}`,
    title: line.replace(/^[•\-*·]\s*/, '').trim(),
    description: line,
    date: '2024',
  }));
}

function formatSkillName(skill: string): string {
  const specialCases: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'c++': 'C++',
    'c#': 'C#',
    'html': 'HTML5',
    'css': 'CSS3',
    'react': 'React',
    'react.js': 'React',
    'reactjs': 'React',
    'next.js': 'Next.js',
    'nextjs': 'Next.js',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'fastapi': 'FastAPI',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'aws': 'AWS',
    'gcp': 'GCP',
    'ci/cd': 'CI/CD',
    'rest api': 'REST APIs',
    'rest apis': 'REST APIs',
    'graphql': 'GraphQL',
    'github': 'GitHub',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
  };

  const lower = skill.toLowerCase().trim();
  if (specialCases[lower]) return specialCases[lower];
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
