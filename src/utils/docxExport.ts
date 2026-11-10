import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  Packer,
  PageBreak,
  convertInchesToTwip,
} from 'docx';
import {
  ProjectReportDocument,
  AssignmentDocument,
  CaseStudyDocument,
} from '../types/academic';

// Helper for download
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const PRIMARY_FONT = 'Times New Roman';

// 1. PROJECT REPORT DOCX GENERATOR
export async function exportProjectReportDocx(report: ProjectReportDocument): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // =================== COVER PAGE ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'INSTITUTE OF AERONAUTICAL ENGINEERING',
          font: PRIMARY_FONT,
          bold: true,
          size: 32, // 16pt
          color: '0B3B60',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: '(Autonomous)',
          font: PRIMARY_FONT,
          bold: true,
          size: 24, // 12pt
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Dundigal, Hyderabad - 500043, Telangana\nNAAC 'A+' Grade | Accredited by NBA | Affiliated to JNTUH",
          font: PRIMARY_FONT,
          size: 20, // 10pt
          color: '555555',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: report.reportType === 'cep' ? 'A REPORT ON COMPLEX ENGINEERING PROBLEM' : 'A PROJECT REPORT ON',
          font: PRIMARY_FONT,
          size: 24,
          bold: true,
          color: '333333',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      children: [
        new TextRun({
          text: report.title.toUpperCase(),
          font: PRIMARY_FONT,
          bold: true,
          size: 36, // 18pt
          color: '0B3B60',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: 'Submitted in partial fulfillment of the requirements for the award of the degree of',
          font: PRIMARY_FONT,
          italics: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `${report.program || 'BACHELOR OF TECHNOLOGY'}\nIN\n${report.branch.toUpperCase()}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 26,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: 'Submitted By:',
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `${report.studentName} (Roll No: ${report.rollNumber})\nSection: ${report.section}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: 'Under the Esteemed Guidance of:',
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [
        new TextRun({
          text: `${report.guideName}\n${report.guideDesignation}\n${report.department}`,
          font: PRIMARY_FONT,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: `ACADEMIC YEAR: ${report.academicYear || '2025-2026'}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =================== SELF ASSESSMENT FORM (IF CEP) ===================
  if (report.selfAssessment) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: 'COMPLEX PROBLEM-SOLVING SELF-ASSESSMENT FORM',
            font: PRIMARY_FONT,
            bold: true,
            size: 28,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: 'Course Name: ',
            font: PRIMARY_FONT,
            bold: true,
            size: 22,
          }),
          new TextRun({ text: `${report.courseName} (${report.courseCode})\n`, font: PRIMARY_FONT, size: 22 }),
          new TextRun({ text: 'Student Name: ', font: PRIMARY_FONT, bold: true, size: 22 }),
          new TextRun({ text: `${report.studentName} (${report.rollNumber})\n`, font: PRIMARY_FONT, size: 22 }),
          new TextRun({ text: 'Problem Complexity Justification: ', font: PRIMARY_FONT, bold: true, size: 22 }),
          new TextRun({ text: `${report.selfAssessment.problemComplexityJustification}\n`, font: PRIMARY_FONT, size: 22 }),
        ],
      })
    );

    // PO Mapping Table
    const poRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Program Outcome (PO)', bold: true, font: PRIMARY_FONT })] })],
            width: { size: 35, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Correlation', bold: true, font: PRIMARY_FONT })] })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Justification / Mapping Evidence', bold: true, font: PRIMARY_FONT })] })],
            width: { size: 45, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ];

    (report.selfAssessment.poMapping || []).forEach((item) => {
      poRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.po, font: PRIMARY_FONT })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.correlation, font: PRIMARY_FONT })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.justification, font: PRIMARY_FONT })] })] }),
          ],
        })
      );
    });

    children.push(
      new Table({
        rows: poRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({ spacing: { before: 200 }, children: [new PageBreak()] })
    );
  }

  // =================== DECLARATION ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: 'DECLARATION',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 400 }, // 1.5 line spacing
      children: [
        new TextRun({
          text: report.declaration ||
            `I hereby declare that the project report entitled "${report.title}" submitted to Institute of Aeronautical Engineering, Dundigal, Hyderabad, in partial fulfillment of the requirements for the award of the Degree of ${report.program} in ${report.branch}, is a record of bona fide work carried out by me under the guidance of ${report.guideName}, ${report.guideDesignation}, Department of ${report.department}.\n\nI further declare that this work has not been submitted previously to any other university or institute for the award of any degree or diploma.`,
          font: PRIMARY_FONT,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 600 },
      children: [
        new TextRun({
          text: `Date: ${report.date || new Date().toLocaleDateString()}\nPlace: Hyderabad\n\n\n___________________________\n${report.studentName}\nRoll No: ${report.rollNumber}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =================== CERTIFICATE ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'INSTITUTE OF AERONAUTICAL ENGINEERING',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
          color: '0B3B60',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: report.department.toUpperCase(),
          font: PRIMARY_FONT,
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: 'CERTIFICATE',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 600 },
      children: [
        new TextRun({
          text: report.certificate ||
            `This is to certify that the project report entitled "${report.title}" is a bona fide record of work done by ${report.studentName} (Roll No: ${report.rollNumber}) in partial fulfillment of the academic requirements at Institute of Aeronautical Engineering, Dundigal, Hyderabad during the academic year ${report.academicYear}.\n\nThis project work has been carried out under our supervision and guidance, and the results incorporated in this report have been verified and found satisfactory.`,
          font: PRIMARY_FONT,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 800 },
      children: [
        new TextRun({
          text: `\n\n___________________________\t\t___________________________\nInternal Guide: ${report.guideName}\t\tHead of the Department\n${report.guideDesignation}\t\t${report.department}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =================== ACKNOWLEDGEMENT ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: 'ACKNOWLEDGEMENT',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 300 },
      children: [
        new TextRun({
          text: report.acknowledgement ||
            `I express my deep sense of gratitude and sincere thanks to my guide ${report.guideName}, ${report.guideDesignation}, Department of ${report.department}, for his/her inspiring guidance, continuous encouragement, and valuable suggestions throughout the progress of this project.\n\nI am profoundly thankful to the Head of the Department and the Principal of Institute of Aeronautical Engineering for providing excellent infrastructure, laboratory facilities, and support.\n\nFinally, I express my sincere appreciation to my parents, faculty members, and fellow students for their constant encouragement and assistance.`,
          font: PRIMARY_FONT,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: `${report.studentName}\nRoll No: ${report.rollNumber}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =================== ABSTRACT ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: 'ABSTRACT',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 300 },
      children: [
        new TextRun({
          text: report.abstract,
          font: PRIMARY_FONT,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: `Keywords: ${report.technologies.join(', ')}, ${report.courseName}, Engineering Optimization.`,
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =================== TABLE OF CONTENTS PREVIEW ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: 'TABLE OF CONTENTS',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Title Page\t\t\t\ti\nDeclaration\t\t\t\tii\nCertificate\t\t\t\tiii\nApproval Sheet\t\t\t\tiv\nAcknowledgement\t\t\t\tv\nAbstract\t\t\t\tvi\n',
          font: PRIMARY_FONT,
          size: 24,
        }),
      ],
    })
  );

  (report.chapters || []).forEach((chap) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Chapter ${chap.chapterNumber} – ${chap.chapterTitle}\n`,
            font: PRIMARY_FONT,
            bold: true,
            size: 24,
          }),
        ],
      })
    );
    chap.sections.forEach((sec) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `   ${sec.sectionNumber} ${sec.title}\n`,
              font: PRIMARY_FONT,
              size: 22,
            }),
          ],
        })
      );
    });
  });

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'References\n',
          font: PRIMARY_FONT,
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =================== CHAPTERS ===================
  (report.chapters || []).forEach((chap) => {
    // Chapter Title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: `CHAPTER ${chap.chapterNumber}`,
            font: PRIMARY_FONT,
            bold: true,
            size: 32, // 16pt
            color: '0B3B60',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: chap.chapterTitle.toUpperCase(),
            font: PRIMARY_FONT,
            bold: true,
            size: 28, // 14pt
          }),
        ],
      })
    );

    chap.sections.forEach((sec) => {
      children.push(
        new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: `${sec.sectionNumber} ${sec.title}`,
              font: PRIMARY_FONT,
              bold: true,
              size: 26, // 13pt
              color: '1E293B',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360, after: 200 }, // 1.5 line spacing
          children: [
            new TextRun({
              text: sec.content,
              font: PRIMARY_FONT,
              size: 24, // 12pt
            }),
          ],
        })
      );
    });

    children.push(new Paragraph({ children: [new PageBreak()] }));
  });

  // =================== REFERENCES ===================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
      children: [
        new TextRun({
          text: 'REFERENCES',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
        }),
      ],
    })
  );

  (report.references || []).forEach((ref, idx) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360, after: 140 },
        children: [
          new TextRun({
            text: `[${idx + 1}] ${ref}`,
            font: PRIMARY_FONT,
            size: 22,
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'IARE - SMART ACADEMIC AI',
                    font: PRIMARY_FONT,
                    size: 18,
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: PRIMARY_FONT,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_IARE_Report.docx`);
}

// 2. ASSIGNMENT DOCX GENERATOR
export async function exportAssignmentDocx(assignment: AssignmentDocument): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: 'INSTITUTE OF AERONAUTICAL ENGINEERING',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
          color: '0B3B60',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `DEPARTMENT OF ${assignment.branch.toUpperCase()}`,
          font: PRIMARY_FONT,
          bold: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `${assignment.assignmentNumber} - CONTINUOUS INTERNAL ASSESSMENT`,
          font: PRIMARY_FONT,
          bold: true,
          size: 24,
        }),
      ],
    })
  );

  // Student details table
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Course: ', bold: true, font: PRIMARY_FONT }),
                  new TextRun({ text: `${assignment.subjectName} (${assignment.courseCode})`, font: PRIMARY_FONT }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Academic Year: ', bold: true, font: PRIMARY_FONT }),
                  new TextRun({ text: assignment.academicYear || '2025-2026', font: PRIMARY_FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Student Name: ', bold: true, font: PRIMARY_FONT }),
                  new TextRun({ text: assignment.studentName, font: PRIMARY_FONT }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Roll Number: ', bold: true, font: PRIMARY_FONT }),
                  new TextRun({ text: `${assignment.rollNumber} (Sec: ${assignment.section})`, font: PRIMARY_FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(metaTable, new Paragraph({ spacing: { after: 300 } }));

  // Questions and Answers
  (assignment.questions || []).forEach((q) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `Q${q.questionNumber}. ${q.question}`,
            font: PRIMARY_FONT,
            bold: true,
            size: 24,
            color: '0B3B60',
          }),
          new TextRun({
            text: ` [Marks: ${q.marks || 5} | Bloom: ${q.bloomLevel || 'L3'} | CO: ${q.courseOutcome || 'CO1'}]`,
            font: PRIMARY_FONT,
            italics: true,
            size: 20,
            color: '666666',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 320, after: 240 },
        children: [
          new TextRun({
            text: q.answer,
            font: PRIMARY_FONT,
            size: 22,
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT], font: PRIMARY_FONT })],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${assignment.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`);
}

// 3. CASE STUDY DOCX GENERATOR
export async function exportCaseStudyDocx(study: CaseStudyDocument): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: 'INSTITUTE OF AERONAUTICAL ENGINEERING',
          font: PRIMARY_FONT,
          bold: true,
          size: 28,
          color: '0B3B60',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'ENGINEERING CASE STUDY ANALYSIS',
          font: PRIMARY_FONT,
          bold: true,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: study.title.toUpperCase(),
          font: PRIMARY_FONT,
          bold: true,
          size: 30,
          color: '0B3B60',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Subject: ${study.subject}\nAuthor: ${study.studentName} (${study.rollNumber}, Section ${study.section})\nBranch: ${study.branch}`,
          font: PRIMARY_FONT,
          size: 22,
        }),
      ],
    })
  );

  (study.sections || []).forEach((sec) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: sec.title,
            font: PRIMARY_FONT,
            bold: true,
            size: 26,
            color: '0B3B60',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 340, after: 200 },
        children: [
          new TextRun({
            text: sec.content,
            font: PRIMARY_FONT,
            size: 24,
          }),
        ],
      })
    );
  });

  if (study.references?.length) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'REFERENCES',
            font: PRIMARY_FONT,
            bold: true,
            size: 26,
          }),
        ],
      })
    );
    study.references.forEach((ref, idx) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${idx + 1}] ${ref}`,
              font: PRIMARY_FONT,
              size: 22,
            }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT], font: PRIMARY_FONT })],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${study.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_CaseStudy.docx`);
}
