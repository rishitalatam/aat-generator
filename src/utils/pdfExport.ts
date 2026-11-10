import { jsPDF } from 'jspdf';
import {
  ProjectReportDocument,
  AssignmentDocument,
  CaseStudyDocument,
} from '../types/academic';

export function exportProjectReportPdf(report: ProjectReportDocument): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawFooter();
    }
  };

  const drawFooter = () => {
    const totalPages = (doc as any).internal.getNumberOfPages();
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `IARE - SMART ACADEMIC AI | Page ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // =================== COVER PAGE ===================
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(11, 59, 96); // IARE Navy
  doc.text('INSTITUTE OF AERONAUTICAL ENGINEERING', pageWidth / 2, y + 10, {
    align: 'center',
  });

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('(Autonomous)', pageWidth / 2, y + 17, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text(
    "Dundigal, Hyderabad - 500043, Telangana\nNAAC 'A+' Grade | NBA Accredited | Affiliated to JNTUH",
    pageWidth / 2,
    y + 24,
    { align: 'center' }
  );

  // Decorative rule
  doc.setDrawColor(217, 119, 6); // Amber
  doc.setLineWidth(0.8);
  doc.line(margin + 20, y + 36, pageWidth - margin - 20, y + 36);

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(
    report.reportType === 'cep'
      ? 'A REPORT ON COMPLEX ENGINEERING PROBLEM'
      : 'A PROJECT REPORT ON',
    pageWidth / 2,
    y + 55,
    { align: 'center' }
  );

  doc.setFontSize(16);
  doc.setTextColor(11, 59, 96);
  const titleLines = doc.splitTextToSize(report.title.toUpperCase(), contentWidth - 10);
  doc.text(titleLines, pageWidth / 2, y + 70, { align: 'center' });

  const titleHeight = titleLines.length * 7;
  let curY = y + 70 + titleHeight + 10;

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(
    'Submitted in partial fulfillment of the requirements for the award of the degree of',
    pageWidth / 2,
    curY,
    { align: 'center' }
  );

  curY += 8;
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `${(report.program || 'BACHELOR OF TECHNOLOGY').toUpperCase()} IN ${report.branch.toUpperCase()}`,
    pageWidth / 2,
    curY,
    { align: 'center' }
  );

  curY += 25;
  doc.setFontSize(10);
  doc.text('Submitted By:', pageWidth / 2, curY, { align: 'center' });
  curY += 6;
  doc.setFontSize(12);
  doc.text(
    `${report.studentName} (Roll No: ${report.rollNumber}) • Section ${report.section}`,
    pageWidth / 2,
    curY,
    { align: 'center' }
  );

  curY += 20;
  doc.setFontSize(10);
  doc.text('Under the Esteemed Guidance of:', pageWidth / 2, curY, { align: 'center' });
  curY += 6;
  doc.setFontSize(11);
  doc.text(
    `${report.guideName}, ${report.guideDesignation}\n${report.department}`,
    pageWidth / 2,
    curY,
    { align: 'center' }
  );

  curY += 30;
  doc.setFontSize(11);
  doc.text(`ACADEMIC YEAR: ${report.academicYear || '2025-2026'}`, pageWidth / 2, curY, {
    align: 'center',
  });

  // =================== PRELIMINARIES ===================
  doc.addPage();
  y = margin;
  drawFooter();

  // DECLARATION
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 59, 96);
  doc.text('DECLARATION', pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  const declLines = doc.splitTextToSize(
    report.declaration ||
      `I hereby declare that the project report entitled "${report.title}" submitted to Institute of Aeronautical Engineering, Dundigal, Hyderabad, in partial fulfillment of the requirements for the award of the Degree of ${report.program} in ${report.branch}, is a record of bona fide work carried out by me under the guidance of ${report.guideName}, ${report.guideDesignation}, Department of ${report.department}.`,
    contentWidth
  );
  doc.text(declLines, margin, y);
  y += declLines.length * 6 + 15;

  doc.setFont('times', 'bold');
  doc.text(
    `Date: ${report.date || 'March 2026'}\nPlace: Hyderabad\n\n\n${report.studentName}\nRoll No: ${report.rollNumber}`,
    margin,
    y
  );

  // =================== ABSTRACT ===================
  doc.addPage();
  y = margin;
  drawFooter();

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 59, 96);
  doc.text('ABSTRACT', pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  const absLines = doc.splitTextToSize(report.abstract, contentWidth);
  doc.text(absLines, margin, y);
  y += absLines.length * 6 + 10;

  doc.setFont('times', 'bold');
  doc.text(`Keywords: ${report.technologies.join(', ')}, ${report.courseName}`, margin, y);

  // =================== CHAPTERS 1 TO 5 ===================
  (report.chapters || []).forEach((chap) => {
    doc.addPage();
    y = margin;
    drawFooter();

    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(11, 59, 96);
    doc.text(`CHAPTER ${chap.chapterNumber}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(13);
    doc.text(chap.chapterTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 14;

    chap.sections.forEach((sec) => {
      checkPageBreak(30);

      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`${sec.sectionNumber} ${sec.title}`, margin, y);
      y += 7;

      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(50, 50, 50);

      const secLines = doc.splitTextToSize(sec.content, contentWidth);
      secLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin, y);
        y += 5.5;
      });

      y += 6;
    });
  });

  // =================== REFERENCES ===================
  if (report.references?.length) {
    doc.addPage();
    y = margin;
    drawFooter();

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 59, 96);
    doc.text('REFERENCES', pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    report.references.forEach((ref, idx) => {
      const refText = `[${idx + 1}] ${ref}`;
      const refLines = doc.splitTextToSize(refText, contentWidth);
      checkPageBreak(refLines.length * 5 + 4);
      doc.text(refLines, margin, y);
      y += refLines.length * 5 + 4;
    });
  }

  doc.save(`${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_IARE_Report.pdf`);
}

// Assignment PDF Exporter
export function exportAssignmentPdf(assignment: AssignmentDocument): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawFooter();
    }
  };

  const drawFooter = () => {
    const total = (doc as any).internal.getNumberOfPages();
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `IARE • ${assignment.assignmentNumber} • Page ${total}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  };

  // Header
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 59, 96);
  doc.text('INSTITUTE OF AERONAUTICAL ENGINEERING', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(11);
  doc.text(`DEPARTMENT OF ${assignment.branch.toUpperCase()}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 6;

  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(
    `${assignment.assignmentNumber} - CONTINUOUS INTERNAL ASSESSMENT`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 10;

  // Metadata block
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  doc.text(
    `Course: ${assignment.subjectName} (${assignment.courseCode})  |  Year: ${assignment.academicYear || '2025-2026'}`,
    margin + 4,
    y + 6
  );
  doc.text(
    `Student: ${assignment.studentName}  |  Roll No: ${assignment.rollNumber} (Sec: ${assignment.section})`,
    margin + 4,
    y + 13
  );
  y += 24;

  // Questions
  (assignment.questions || []).forEach((q) => {
    checkPageBreak(25);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 59, 96);
    doc.text(
      `Q${q.questionNumber}. ${q.question}  [Marks: ${q.marks || 5} | Bloom: ${q.bloomLevel || 'L3'} | CO: ${q.courseOutcome || 'CO1'}]`,
      margin,
      y
    );
    y += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const ansLines = doc.splitTextToSize(q.answer, contentWidth);
    ansLines.forEach((line: string) => {
      checkPageBreak(5.5);
      doc.text(line, margin, y);
      y += 5.2;
    });

    y += 6;
  });

  doc.save(`${assignment.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

// Case Study PDF Exporter
export function exportCaseStudyPdf(study: CaseStudyDocument): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
      const total = (doc as any).internal.getNumberOfPages();
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`IARE Case Study | Page ${total}`, pageWidth / 2, pageHeight - 8, {
        align: 'center',
      });
    }
  };

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(11, 59, 96);
  doc.text('INSTITUTE OF AERONAUTICAL ENGINEERING', pageWidth / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(12);
  doc.text('ENGINEERING CASE STUDY ANALYSIS', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(13);
  doc.setTextColor(217, 119, 6);
  const titleLines = doc.splitTextToSize(study.title.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 6 + 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(70, 70, 70);
  doc.text(
    `Subject: ${study.subject}  |  Author: ${study.studentName} (${study.rollNumber}, Sec: ${study.section})`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 12;

  (study.sections || []).forEach((sec) => {
    checkPageBreak(25);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 59, 96);
    doc.text(sec.title, margin, y);
    y += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const lines = doc.splitTextToSize(sec.content, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(5.5);
      doc.text(line, margin, y);
      y += 5.2;
    });

    y += 6;
  });

  doc.save(`${study.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_CaseStudy.pdf`);
}
