import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ResumeAI development database...');

  // 1. Clean existing records
  await prisma.interviewQuestion.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.jobMatch.deleteMany();
  await prisma.jobDescription.deleteMany();
  await prisma.resumeAnalysis.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.aIRequest.deleteMany();
  await prisma.file.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@resumeai.com',
      passwordHash,
      name: 'Alex Chen',
      role: 'USER',
      targetRole: 'Full-Stack Software Engineer',
      experienceLevel: 'Entry-Level / 3rd-Year CS Student',
      preferredIndustry: 'Enterprise Software & Cloud Platforms',
      linkedin: 'https://linkedin.com/in/alexchen-dev',
      github: 'https://github.com/alexchen-dev',
      portfolio: 'https://alexchen.dev',
    },
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (Password: Password123!)`);

  // 3. Create Sample Structured Resume Data
  const sampleStructuredData = {
    personal: {
      name: 'Alex Chen',
      email: 'alex.chen.dev@example.com',
      phone: '+1 (555) 382-9104',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/alexchen-dev',
      github: 'https://github.com/alexchen-dev',
      portfolio: 'https://alexchen.dev',
      title: 'Full-Stack Software Engineer',
    },
    summary:
      'Proactive Computer Science student and software engineer with hands-on experience building performant, type-safe full-stack web applications. Demonstrated capability in designing RESTful microservices, optimizing database performance, and building responsive React user interfaces with clean architecture.',
    education: [
      {
        id: 'edu-1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: 'Aug 2022',
        endDate: 'May 2026',
        current: true,
        gpa: '3.85 / 4.0',
        location: 'Berkeley, CA',
        achievements: [
          "Dean's Honors List (3 consecutive semesters)",
          'Relevant Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Computer Architecture',
        ],
      },
    ],
    experience: [
      {
        id: 'exp-1',
        company: 'NovaTech Solutions',
        position: 'Software Engineering Intern',
        location: 'San Francisco, CA',
        startDate: 'Jun 2024',
        endDate: 'Aug 2024',
        current: false,
        highlights: [
          'Engineered and deployed 8 RESTful API microservices using Node.js, Express, and PostgreSQL, reducing endpoint response times by 32%.',
          'Architected responsive client dashboard components in React and TypeScript with TanStack Query, decreasing data loading delays for 12,000+ active daily users.',
          'Integrated automated unit and integration test suites using Vitest and Supertest, elevating codebase test coverage from 58% to 86%.',
          'Collaborated in bi-weekly Agile sprints, participating in architectural code reviews and Docker containerization pipelines.',
        ],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'CloudScale — Distributed Metrics & Observability Platform',
        role: 'Lead Full-Stack Developer',
        description:
          'A high-throughput telemetry ingestion and real-time observability visualization dashboard for distributed container fleets.',
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Recharts'],
        link: 'https://cloudscale-demo.dev',
        githubUrl: 'https://github.com/alexchen-dev/cloudscale',
        highlights: [
          'Architected real-time metrics streaming dashboard processing 50,000+ synthetic telemetry events/sec with sub-50ms latency.',
          'Designed relational database schema in PostgreSQL with indexed time-series tables, accelerating analytics querying speed by 45%.',
          'Built modular, accessible UI design system using Tailwind CSS and Recharts with instant dark/light theme switching.',
        ],
      },
      {
        id: 'proj-2',
        name: 'DevConnect — Real-Time Collaborative Workspace',
        role: 'Full-Stack Engineer',
        description:
          'Collaborative document editing and pair programming workspace with granular access control and live presence.',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'REST APIs', 'JWT'],
        link: 'https://devconnect-workspace.dev',
        githubUrl: 'https://github.com/alexchen-dev/devconnect',
        highlights: [
          'Developed multi-tenant collaborative workspace supporting synchronized state management across concurrent client sessions.',
          'Enforced robust security standards utilizing JWT access/refresh token rotation, bcrypt password hashing, and role-based access control (RBAC).',
          'Implemented end-to-end CI/CD automated test workflow via GitHub Actions, validating build integrity on each push.',
        ],
      },
    ],
    skills: {
      technical: [
        'JavaScript (ES6+)',
        'TypeScript',
        'Python',
        'React',
        'Node.js',
        'Express.js',
        'PostgreSQL',
        'RESTful APIs',
        'GraphQL',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'Data Structures',
        'Algorithms',
      ],
      tools: [
        'Git',
        'GitHub',
        'Docker',
        'Postman',
        'Prisma ORM',
        'Vitest',
        'Vite',
        'VS Code',
        'Linux/Bash',
        'Vercel',
      ],
      softSkills: [
        'Problem Solving',
        'Technical Communication',
        'Agile/Scrum Collaboration',
        'Code Review Leadership',
        'Adaptability',
      ],
      languages: ['English (Fluent)', 'Mandarin (Conversational)'],
    },
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services (AWS)',
        issueDate: 'Jan 2024',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
    ],
    achievements: [
      {
        id: 'ach-1',
        title: '1st Place — CalHacks Collegiate Hackathon (2024)',
        description: 'Built an AI-driven accessibility transcription tool among 300+ collegiate developer teams.',
        date: 'Oct 2024',
      },
    ],
    leadership: [
      'Vice President, ACM Student Chapter at UC Berkeley (Organized 12 tech workshops and speaker panels for 400+ members)',
    ],
    extracurricular: [
      'Open Source Contributor: Submitted PRs to popular React and developer tooling repositories.',
    ],
  };

  const sampleRawText = `
Alex Chen
San Francisco, CA • +1 (555) 382-9104 • alex.chen.dev@example.com
LinkedIn: linkedin.com/in/alexchen-dev • GitHub: github.com/alexchen-dev • Portfolio: alexchen.dev

PROFESSIONAL SUMMARY
Proactive Computer Science student and software engineer with hands-on experience building performant, type-safe full-stack web applications. Demonstrated capability in designing RESTful microservices, optimizing database performance, and building responsive React user interfaces with clean architecture.

EDUCATION
University of California, Berkeley — Bachelor of Science in Computer Science | GPA: 3.85/4.0 (Aug 2022 – May 2026)
Dean's Honors List (3 consecutive semesters). Coursework: Data Structures, Operating Systems, Database Systems.

TECHNICAL SKILLS
• Languages & Frameworks: JavaScript, TypeScript, Python, React, Node.js, Express.js, PostgreSQL, Tailwind CSS, REST APIs
• Developer Tools: Git, GitHub, Docker, Postman, Prisma ORM, Vitest, Vite, Linux/Bash, Vercel
• Soft Skills: Problem Solving, Technical Communication, Agile/Scrum, Code Review Leadership

WORK EXPERIENCE
NovaTech Solutions — Software Engineering Intern (Jun 2024 – Aug 2024 | San Francisco, CA)
• Engineered and deployed 8 RESTful API microservices using Node.js, Express, and PostgreSQL, reducing endpoint response times by 32%.
• Architected responsive client dashboard components in React and TypeScript with TanStack Query, decreasing data loading delays for 12,000+ active daily users.
• Integrated automated unit and integration test suites using Vitest and Supertest, elevating codebase test coverage from 58% to 86%.
• Collaborated in bi-weekly Agile sprints, participating in architectural code reviews and Docker containerization pipelines.

KEY PROJECTS
CloudScale — Distributed Metrics & Observability Platform (React, TypeScript, Node.js, PostgreSQL, Docker, Recharts)
• Architected real-time metrics streaming dashboard processing 50,000+ synthetic telemetry events/sec with sub-50ms latency.
• Designed relational database schema in PostgreSQL with indexed time-series tables, accelerating analytics querying speed by 45%.
• Built modular, accessible UI design system using Tailwind CSS and Recharts with instant dark/light theme switching.

DevConnect — Real-Time Collaborative Workspace (React, TypeScript, Node.js, PostgreSQL, Prisma, JWT)
• Developed multi-tenant collaborative workspace supporting synchronized state management across concurrent client sessions.
• Enforced robust security standards utilizing JWT access/refresh token rotation, bcrypt password hashing, and role-based access control (RBAC).
• Implemented end-to-end CI/CD automated test workflow via GitHub Actions, validating build integrity on each push.

CERTIFICATIONS & AWARDS
• AWS Certified Cloud Practitioner (2024)
• 1st Place Winner — CalHacks Collegiate Hackathon (2024)
  `.trim();

  // 4. Create Sample Resume
  const resume = await prisma.resume.create({
    data: {
      userId: demoUser.id,
      title: 'Full-Stack Software Engineer (Primary)',
      targetRole: 'Full-Stack Software Engineer',
      templateId: 'ats-classic',
      rawText: sampleRawText,
      structuredData: JSON.stringify(sampleStructuredData),
      atsScore: 88,
      completenessScore: 95,
      isBase: true,
    },
  });

  // 5. Create Resume Version
  await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      versionNumber: 1,
      title: 'v1.0 — Initial Master Resume',
      templateId: 'ats-classic',
      structuredData: JSON.stringify(sampleStructuredData),
      atsScore: 88,
      changeSummary: 'Comprehensive portfolio resume with full-stack projects and internship metrics.',
    },
  });

  // 6. Create Analysis Record
  await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      atsScore: 88,
      categoryScores: JSON.stringify({
        atsCompatibility: 94,
        resumeStructure: 92,
        skills: 90,
        experience: 85,
        projects: 92,
        education: 96,
        achievements: 88,
        keywords: 86,
        impact: 84,
        formatting: 95,
      }),
      strengths: JSON.stringify([
        {
          title: 'Strong Technical Stack Coverage',
          explanation: 'Covers modern frontend (React, TypeScript, Tailwind) and backend (Node.js, PostgreSQL, REST APIs) with high clarity.',
          category: 'Skills',
        },
        {
          title: 'High Quantifiable Impact Density',
          explanation: 'Over 80% of project and work experience bullets include measurable metrics (e.g. 32% response time reduction, 12,000+ users, 50k events/sec).',
          category: 'Impact',
        },
        {
          title: 'Direct GitHub & LinkedIn Verification',
          explanation: 'Live links to GitHub repository codebases and LinkedIn profile enhance authenticity for technical recruiters.',
          category: 'ATS Compatibility',
        },
        {
          title: 'Clear Action-Verb Openers',
          explanation: 'Bullet points consistently lead with commanding engineering verbs like Engineered, Architected, and Integrated.',
          category: 'Structure',
        },
      ]),
      weaknesses: JSON.stringify([
        {
          title: 'Add Cloud Deployment Details to Projects',
          explanation: 'While AWS certification is listed, project bullet points do not explicitly detail cloud hosting (e.g. AWS EC2/S3 or Vercel edge deployment).',
          severity: 'Medium',
          recommendation: 'Specify deployment infrastructure and CI/CD pipelines in the CloudScale project bullets.',
          category: 'Projects',
        },
        {
          title: 'Include System Design / Architecture Keywords',
          explanation: 'For mid-level or high-growth engineering roles, mentioning caching layers (e.g. Redis) or message queues increases keyword score.',
          severity: 'Low',
          recommendation: 'Mention data caching strategies or background job workers if utilized.',
          category: 'Keywords',
        },
      ]),
      improvements: JSON.stringify([
        {
          section: 'Summary',
          originalText: sampleStructuredData.summary,
          suggestedText: 'Results-driven Full-Stack Software Engineer with proven experience designing low-latency REST APIs and responsive TypeScript/React interfaces. Built high-throughput data platforms handling 50k+ events/sec with rigorous automated testing.',
          reason: 'Front-loads the highest-performing metric and crystallizes technical specialization.',
        },
      ]),
      keywordAnalysis: JSON.stringify({
        totalKeywords: 28,
        topKeywords: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'Vitest', 'Tailwind CSS'],
        actionVerbsCount: 9,
        measurableMetricsCount: 7,
        missingKeywords: ['Redis', 'AWS ECS', 'Kubernetes', 'CI/CD Pipelines'],
      }),
      deterministicMetrics: JSON.stringify({
        bulletCount: 10,
        avgBulletLength: 18,
        contactCompleteness: 100,
        wordCount: 420,
        readingTimeMin: 2,
        actionVerbRatio: 0.9,
        quantifiedBulletRatio: 0.8,
      }),
    },
  });

  // 7. Create Sample Job Description
  const sampleJob = await prisma.jobDescription.create({
    data: {
      userId: demoUser.id,
      company: 'Stripe',
      role: 'Full-Stack Software Engineer (Early Career)',
      jobUrl: 'https://stripe.com/jobs/full-stack-engineer',
      rawText: `
About Stripe:
Stripe builds economic infrastructure for the internet. Businesses of every size use our software to accept payments and manage their businesses online.

The Role:
We are looking for an ambitious Full-Stack Software Engineer to join our developer dashboard and financial infrastructure team.

What You'll Do:
- Architect, build, and maintain user-facing web applications using React, TypeScript, and modern state management.
- Design and scale backend RESTful microservices and PostgreSQL database schemas.
- Collaborate with designers, product managers, and backend architects to deliver delightful user workflows.
- Write robust unit, integration, and end-to-end tests with high test coverage.
- Participate in agile planning, architecture reviews, and sprint retrospectives.

Minimum Qualifications:
- Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.
- Strong proficiency in modern JavaScript, TypeScript, React, and Node.js.
- Solid understanding of relational database modeling (PostgreSQL / SQL) and REST API principles.
- Experience with Git version control, unit testing (Vitest/Jest), and automated CI/CD workflows.

Preferred Qualifications:
- Hands-on experience with Docker, Redis caching, or cloud infrastructure (AWS/GCP).
- Demonstrated passion for clean code, performance optimization, and developer tooling.
      `.trim(),
      parsedData: JSON.stringify({
        role: 'Full-Stack Software Engineer (Early Career)',
        company: 'Stripe',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git', 'Unit Testing'],
        preferredSkills: ['Docker', 'Redis', 'AWS', 'CI/CD'],
        technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Vitest', 'Git'],
        responsibilities: [
          'Architect and maintain user-facing React web applications.',
          'Design scalable backend RESTful microservices with PostgreSQL.',
          'Implement automated unit and integration tests.',
        ],
        keywords: ['Full-Stack', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Unit Testing', 'CI/CD'],
        minExperienceYears: 1,
        educationLevel: "Bachelor's degree in Computer Science or equivalent",
      }),
    },
  });

  // 8. Create Sample Job Match Record
  await prisma.jobMatch.create({
    data: {
      resumeId: resume.id,
      jobId: sampleJob.id,
      overallScore: 89,
      skillMatchScore: 92,
      expMatchScore: 85,
      eduMatchScore: 98,
      keywordMatchScore: 88,
      matchedSkills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git', 'Vitest', 'Docker']),
      partialSkills: JSON.stringify(['AWS', 'CI/CD']),
      missingSkills: JSON.stringify(['Redis', 'GraphQL']),
      recommendations: JSON.stringify([
        {
          title: 'Emphasize Test Coverage & Automated Quality',
          advice: 'Stripe places high value on testing rigor. Highlight your Vitest/Supertest 86% coverage improvement in the top third of your resume.',
          priority: 'High',
        },
        {
          title: 'Mention Redis or In-Memory Caching in Projects',
          advice: 'The Stripe role prefers caching familiarity. Mention how caching or indexed querying optimized telemetry retrieval in CloudScale.',
          priority: 'Medium',
        },
      ]),
      tailoredDiffs: JSON.stringify([
        {
          section: 'Summary',
          original: sampleStructuredData.summary,
          proposed: 'Full-Stack Software Engineer specializing in TypeScript, React, and Node.js microservices. Proven success engineering scalable REST APIs, optimizing PostgreSQL schemas, and achieving 86% automated test coverage in high-traffic applications.',
          reason: 'Aligns summary directly with Stripe job requirements regarding TypeScript, microservices, and testing rigor.',
        },
      ]),
    },
  });

  // 9. Create Sample Interview Prep Session
  const session = await prisma.interviewSession.create({
    data: {
      resumeId: resume.id,
      jobId: sampleJob.id,
      targetRole: 'Full-Stack Software Engineer',
      targetCompany: 'Stripe',
      readinessScore: 84,
      categoryScores: JSON.stringify({
        technical: 88,
        projects: 85,
        behavioral: 84,
        communication: 80,
      }),
    },
  });

  const sampleQuestions = [
    {
      category: 'Technical',
      question: 'How do you structure asynchronous API requests in React to avoid race conditions and stale UI states?',
      difficulty: 'Medium',
      whyItMatters: 'Tests candidate understanding of React component lifecycle, async cleanup functions, and modern query caching libraries.',
      suggestedAnswerFramework: '1. Explain why race conditions happen (unmounted components or fast consecutive inputs). 2. Detail solutions (TanStack Query query keys / AbortController cancellation). 3. Provide code example from CloudScale.',
      sampleAnswer: 'In my applications, I rely on TanStack Query which automatically handles cancellation and stale-while-revalidate caching. When using native fetch, I attach an AbortController signal inside the useEffect cleanup function to abort pending network requests if parameters change before resolution.',
      order: 1,
    },
    {
      category: 'Technical',
      question: 'When designing a relational PostgreSQL schema for high-throughput telemetry, how do you prevent indexing overhead while maintaining fast read queries?',
      difficulty: 'Hard',
      whyItMatters: 'Evaluates database modeling depth, B-Tree index trade-offs on write-heavy systems, and query planning understanding.',
      suggestedAnswerFramework: '1. Discuss write amplification caused by excessive indexes. 2. Explain composite indexing tailored to actual query filter patterns. 3. Mention partitioning by time or range.',
      sampleAnswer: 'In CloudScale, writes were frequent (50k events/sec), so each additional index slowed down inserts. I designed a composite index on (tenant_id, created_at DESC) specifically matching our dashboard time-series filter, avoiding single-column redundant indexes and using EXPLAIN ANALYZE to verify index scan execution.',
      order: 2,
    },
    {
      category: 'Project',
      question: 'Walk me through the architecture of your CloudScale project. How did you handle 50,000+ synthetic events per second without dropping requests?',
      difficulty: 'Hard',
      whyItMatters: 'Assesses architectural thinking, bottleneck identification, and practical engineering trade-offs.',
      suggestedAnswerFramework: '1. High-level diagram (client, ingestion API, buffer, database). 2. Bottleneck identified (database lock contention). 3. The solution (batch processing and stream buffering).',
      sampleAnswer: 'The core challenge was that writing each telemetry event individually caused disk I/O bottlenecks. I implemented an in-memory buffer on the Node.js ingestion layer that flushed batches of 500 events using multi-row INSERT queries into PostgreSQL, dropping write latency from 220ms to under 35ms.',
      order: 3,
    },
    {
      category: 'Behavioral',
      question: 'Tell me about a time you had to balance shipping a feature quickly versus writing exhaustive test suites.',
      difficulty: 'Medium',
      whyItMatters: 'Measures pragmatism, understanding of engineering velocity vs reliability, and risk assessment.',
      suggestedAnswerFramework: 'STAR format: Situation (internship or hackathon deadline) -> Task (deliver core feature) -> Action (prioritize critical path integration tests first) -> Result (shipped on schedule with 0 critical bugs).',
      sampleAnswer: 'During my internship at NovaTech, we had a tight deadline to ship the analytics dashboard. I prioritized writing end-to-end integration tests for critical payment and authentication flows first, while deferring non-critical edge-case unit tests until the post-release stabilization sprint. We shipped on time with zero production incidents.',
      order: 4,
    },
    {
      category: 'HR',
      question: 'Why are you specifically drawn to Stripe, and what technical challenges excite you most about financial infrastructure?',
      difficulty: 'Easy',
      whyItMatters: 'Tests candidate alignment with Stripe culture of high craftsmanship, developer empathy, and distributed reliability.',
      suggestedAnswerFramework: '1. Emphasize developer-first tooling and extreme reliability standards. 2. Connect to your background in type-safety and robust API design. 3. Reiterate enthusiasm for high-scale challenges.',
      sampleAnswer: 'Stripe sets the global gold standard for developer experience and reliability. Having built full-stack applications with TypeScript and REST APIs, I appreciate the immense engineering discipline required to ensure 99.999% uptime and zero payment discrepancies at global scale.',
      order: 5,
    },
  ];

  for (const q of sampleQuestions) {
    await prisma.interviewQuestion.create({
      data: {
        sessionId: session.id,
        category: q.category,
        question: q.question,
        difficulty: q.difficulty,
        whyItMatters: q.whyItMatters,
        suggestedAnswerFramework: q.suggestedAnswerFramework,
        sampleAnswer: q.sampleAnswer,
        order: q.order,
      },
    });
  }

  console.log('✅ Seed data successfully populated!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
