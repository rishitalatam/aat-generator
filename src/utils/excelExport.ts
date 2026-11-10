import * as XLSX from 'xlsx';
import { SavedDocumentMeta, UserAcademicProfile } from '../types/academic';

export function exportDocumentsDatabaseToExcel(
  docs: SavedDocumentMeta[],
  profile: UserAcademicProfile | null
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Documents Registry
  const registryData = docs.map((d, index) => ({
    'S.No': index + 1,
    'Document ID': d.id,
    'Title': d.title,
    'Academic Tool': d.toolType.replace('_', ' ').toUpperCase(),
    'Course Name': d.subjectName || 'N/A',
    'Course Code': d.courseCode || 'N/A',
    'Created At': new Date(d.createdAt).toLocaleString(),
    'Last Updated': new Date(d.updatedAt).toLocaleString(),
    'Summary': d.summary || '',
  }));

  const wsRegistry = XLSX.utils.json_to_sheet(
    registryData.length > 0
      ? registryData
      : [{ 'S.No': 1, 'Notice': 'No documents generated yet' }]
  );
  XLSX.utils.book_append_sheet(wb, wsRegistry, 'Documents Registry');

  // Sheet 2: Student Academic Profile
  const profileData = [
    { Field: 'Institution', Value: 'Institute of Aeronautical Engineering (Autonomous)' },
    { Field: 'Location', Value: 'Dundigal, Hyderabad - 500043, Telangana' },
    { Field: 'Accreditation', Value: "NAAC 'A+' Grade | NBA Accredited | Affiliated to JNTUH" },
    { Field: 'Student Name', Value: profile?.displayName || 'IARE Student' },
    { Field: 'Roll Number', Value: profile?.rollNumber || 'Not Set' },
    { Field: 'Email Address', Value: profile?.email || 'N/A' },
    { Field: 'Branch / Department', Value: profile?.branch || 'Computer Science and Engineering' },
    { Field: 'Section', Value: profile?.section || 'A' },
    { Field: 'Academic Program', Value: profile?.program || 'Bachelor of Technology (B.Tech)' },
    { Field: 'Default Course Name', Value: profile?.courseName || 'N/A' },
    { Field: 'Default Course Code', Value: profile?.courseCode || 'N/A' },
    { Field: 'Internal Guide Name', Value: profile?.guideName || 'N/A' },
    { Field: 'Guide Designation', Value: profile?.guideDesignation || 'N/A' },
    { Field: 'Total Saved Records', Value: docs.length },
    { Field: 'Export Date', Value: new Date().toLocaleString() },
  ];
  const wsProfile = XLSX.utils.json_to_sheet(profileData);
  XLSX.utils.book_append_sheet(wb, wsProfile, 'Student Profile');

  // Sheet 3: Detailed Breakdown of Project Reports
  const reportRows: any[] = [];
  docs.forEach((doc) => {
    try {
      const content = JSON.parse(doc.contentJson);
      if (doc.toolType === 'project_report' && content.chapters) {
        content.chapters.forEach((ch: any) => {
          (ch.sections || []).forEach((sec: any) => {
            reportRows.push({
              'Project Title': doc.title,
              'Chapter No': ch.chapterNumber,
              'Chapter Title': ch.chapterTitle,
              'Section No': sec.sectionNumber,
              'Section Title': sec.title,
              'Word Count': (sec.content || '').split(/\s+/).length,
              'Content Preview': (sec.content || '').slice(0, 150) + '...',
            });
          });
        });
      }
    } catch {}
  });

  if (reportRows.length > 0) {
    const wsReports = XLSX.utils.json_to_sheet(reportRows);
    XLSX.utils.book_append_sheet(wb, wsReports, 'Project Chapter Details');
  }

  // Sheet 4: AAT Assignments Question Bank
  const assignmentRows: any[] = [];
  docs.forEach((doc) => {
    try {
      const content = JSON.parse(doc.contentJson);
      if (doc.toolType === 'aat_assignment' && content.questions) {
        content.questions.forEach((q: any) => {
          assignmentRows.push({
            'Assignment Title': doc.title,
            'Question No': q.questionNumber,
            'Question Statement': q.question,
            'Bloom Level': q.bloomLevel || 'L3',
            'Course Outcome (CO)': q.courseOutcome || 'CO1',
            'Max Marks': q.marks || 5,
            'Answer Snippet': (q.answer || '').slice(0, 200) + '...',
          });
        });
      }
    } catch {}
  });

  if (assignmentRows.length > 0) {
    const wsAssignments = XLSX.utils.json_to_sheet(assignmentRows);
    XLSX.utils.book_append_sheet(wb, wsAssignments, 'AAT Assignments Bank');
  }

  // Sheet 5: AAT Presentations Deck
  const pptRows: any[] = [];
  docs.forEach((doc) => {
    try {
      const content = JSON.parse(doc.contentJson);
      if (doc.toolType === 'aat_ppt' && content.slides) {
        content.slides.forEach((s: any) => {
          pptRows.push({
            'Presentation Title': doc.title,
            'Slide No': s.slideNumber,
            'Slide Title': s.title,
            'Bullets Count': (s.bullets || []).length,
            'Bullets Summary': (s.bullets || []).join(' | '),
            'Key Takeaway': s.keyTakeaway || '',
            'Speaker Notes': s.notes || '',
          });
        });
      }
    } catch {}
  });

  if (pptRows.length > 0) {
    const wsPpt = XLSX.utils.json_to_sheet(pptRows);
    XLSX.utils.book_append_sheet(wb, wsPpt, 'AAT Slides Breakdown');
  }

  const filename = `IARE_Academic_AI_Database_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Export a single document to Excel
export function exportSingleDocToExcel(meta: SavedDocumentMeta): void {
  const wb = XLSX.utils.book_new();

  try {
    const content = JSON.parse(meta.contentJson);

    if (meta.toolType === 'aat_assignment') {
      const rows = (content.questions || []).map((q: any) => ({
        'Q.No': q.questionNumber,
        'Question': q.question,
        'Bloom Level': q.bloomLevel || 'L3',
        'Course Outcome': q.courseOutcome || 'CO1',
        'Marks': q.marks || 5,
        'Full Answer Solution': q.answer,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Questions & Solutions');
    } else if (meta.toolType === 'aat_ppt') {
      const rows = (content.slides || []).map((s: any) => ({
        'Slide #': s.slideNumber,
        'Title': s.title,
        'Subtitle': s.subtitle || '',
        'Key Takeaway': s.keyTakeaway || '',
        'Key Bullets': (s.bullets || []).join('\n• '),
        'Speaker Notes': s.notes || '',
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Slide Deck Data');
    } else if (meta.toolType === 'project_report') {
      const rows: any[] = [];
      (content.chapters || []).forEach((ch: any) => {
        (ch.sections || []).forEach((sec: any) => {
          rows.push({
            'Chapter #': ch.chapterNumber,
            'Chapter Title': ch.chapterTitle,
            'Section #': sec.sectionNumber,
            'Section Title': sec.title,
            'Content': sec.content,
          });
        });
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Report Chapters');

      if (content.selfAssessment?.poMapping) {
        const wsPO = XLSX.utils.json_to_sheet(content.selfAssessment.poMapping);
        XLSX.utils.book_append_sheet(wb, wsPO, 'PO Correlation');
      }
    } else {
      const rows = (content.sections || []).map((sec: any, idx: number) => ({
        'Section #': idx + 1,
        'Section Title': sec.title,
        'Analysis & Findings': sec.content,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Case Study Sections');
    }

    const filename = `${meta.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error('Error generating single doc Excel:', err);
    alert('Failed to export document to Excel sheet.');
  }
}
