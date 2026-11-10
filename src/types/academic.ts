export type ToolType = 'aat_ppt' | 'aat_assignment' | 'project_report' | 'case_study';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'navy' | 'emerald' | 'purple' | 'crimson' | 'amber';

export interface UserAcademicProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  rollNumber?: string;
  branch?: string;
  section?: string;
  program?: string;
  courseCode?: string;
  courseName?: string;
  guideName?: string;
  guideDesignation?: string;
  theme?: ThemeMode;
  accentColor?: AccentColor;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  keyTakeaway?: string;
  notes?: string;
  layoutType?: 'title' | 'content' | 'two_column' | 'stats' | 'conclusion';
  secondaryBullets?: string[];
}

export interface PPTDocument {
  id: string;
  title: string;
  subjectName: string;
  courseCode: string;
  rollNumber: string;
  studentName: string;
  branch: string;
  section: string;
  themeStyle: 'academic_navy' | 'modern_dark' | 'emerald_clean' | 'crimson_formal';
  slides: SlideItem[];
}

export interface AssignmentQuestion {
  questionNumber: number;
  question: string;
  marks?: number;
  bloomLevel?: string;
  courseOutcome?: string;
  answer: string;
}

export interface AssignmentDocument {
  id: string;
  title: string;
  subjectName: string;
  courseCode: string;
  rollNumber: string;
  studentName: string;
  branch: string;
  section: string;
  assignmentNumber: string;
  academicYear: string;
  questions: AssignmentQuestion[];
}

export interface ReportSection {
  sectionNumber: string; // e.g. "1.1", "1.2"
  title: string;
  content: string;
}

export interface ReportChapter {
  chapterNumber: number;
  chapterTitle: string;
  sections: ReportSection[];
}

export interface SelfAssessmentData {
  problemComplexityJustification: string;
  poMapping: Array<{ po: string; correlation: string; justification: string }>;
  psoMapping: Array<{ pso: string; correlation: string; justification: string }>;
}

export interface ProjectReportDocument {
  id: string;
  title: string;
  reportType: 'cep' | 'course_project' | 'mini_project';
  studentName: string;
  rollNumber: string;
  branch: string;
  section: string;
  program: string;
  courseName: string;
  courseCode: string;
  guideName: string;
  guideDesignation: string;
  department: string;
  academicYear: string;
  date: string;
  technologies: string[];
  selfAssessment?: SelfAssessmentData;
  declaration: string;
  certificate: string;
  approvalSheet: string;
  acknowledgement: string;
  abstract: string;
  chapters: ReportChapter[];
  references: string[];
}

export interface CaseStudySection {
  id: string;
  title: string;
  content: string;
}

export interface CaseStudyDocument {
  id: string;
  title: string;
  subject: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  section: string;
  targetWordCount: number;
  sections: CaseStudySection[];
  references: string[];
}

export interface SavedDocumentMeta {
  id: string;
  userId: string;
  title: string;
  toolType: ToolType;
  subjectName?: string;
  courseCode?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  contentJson: string;
}
