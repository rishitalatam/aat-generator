import {
  PPTDocument,
  AssignmentDocument,
  ProjectReportDocument,
  CaseStudyDocument,
} from '../types/academic';

export async function requestGeneratePpt(payload: {
  topic: string;
  subjectName: string;
  courseCode: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  section: string;
  numberOfSlides: number;
  presentationType: string;
  additionalInstructions?: string;
  themeStyle?: 'academic_navy' | 'modern_dark' | 'emerald_clean' | 'crimson_formal';
}): Promise<PPTDocument> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'aat_ppt', payload }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate AAT PPT');
  }
  return data.data;
}

export async function requestGenerateAssignment(payload: {
  topicOrQuestions: string;
  subjectName: string;
  courseCode: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  section: string;
  numberOfQuestions: number;
  answerLength: 'Short' | 'Medium' | 'Comprehensive';
  assignmentNumber?: string;
  academicYear?: string;
}): Promise<AssignmentDocument> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'aat_assignment', payload }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate AAT Assignment');
  }
  return data.data;
}

export async function requestGenerateProjectReport(payload: {
  projectTitle: string;
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
  date?: string;
  academicYear?: string;
  projectDescription: string;
  technologiesUsed?: string;
  reportType: 'cep' | 'course_project' | 'mini_project';
}): Promise<ProjectReportDocument> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'project_report', payload }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate Project Report');
  }
  return data.data;
}

export async function requestGenerateCaseStudy(payload: {
  title: string;
  subject: string;
  problemDescription: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  section: string;
  targetWordCount: number;
  answerFormat?: string;
}): Promise<CaseStudyDocument> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'case_study', payload }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate Case Study');
  }
  return data.data;
}

export async function requestRegenerateSection(payload: {
  documentType: 'ppt_slide' | 'assignment_question' | 'report_section' | 'casestudy_section';
  context: {
    documentTitle: string;
    sectionTitle: string;
    currentContent?: string;
    instructions?: string;
  };
}): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'regenerate_section', payload }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to regenerate section');
  }
  return data.data;
}
