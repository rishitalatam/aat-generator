import pptxgen from 'pptxgenjs';
import { PPTDocument } from '../types/academic';

export async function exportPptx(ppt: PPTDocument): Promise<void> {
  const pres = new pptxgen();

  pres.layout = 'LAYOUT_16x9';
  pres.author = ppt.studentName;
  pres.company = 'Institute of Aeronautical Engineering';
  pres.subject = ppt.subjectName;
  pres.title = ppt.title;

  const isDark = ppt.themeStyle === 'modern_dark';
  const bgColor = isDark ? '0F172A' : ppt.themeStyle === 'emerald_clean' ? 'F0FDF4' : ppt.themeStyle === 'crimson_formal' ? 'FFF1F2' : 'F8FAFC';
  const primaryColor = isDark ? '38BDF8' : ppt.themeStyle === 'emerald_clean' ? '064E3B' : ppt.themeStyle === 'crimson_formal' ? '881337' : '0B3B60';
  const textColor = isDark ? 'F1F5F9' : '1E293B';
  const cardBg = isDark ? '1E293B' : 'FFFFFF';
  const accentColor = isDark ? '818CF8' : '2563EB';

  (ppt.slides || []).forEach((item, index) => {
    const slide = pres.addSlide();
    slide.background = { color: bgColor };

    if (item.notes) {
      slide.addNotes(item.notes);
    }

    // Cover slide
    if (index === 0 || item.layoutType === 'title') {
      // Top header banner
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 1.1,
        fill: { color: primaryColor },
      });

      slide.addText('INSTITUTE OF AERONAUTICAL ENGINEERING (Autonomous)', {
        x: 0.5,
        y: 0.2,
        w: 12.3,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial',
      });

      slide.addText("Dundigal, Hyderabad - 500043 | NAAC 'A+' Grade | NBA Accredited", {
        x: 0.5,
        y: 0.65,
        w: 12.3,
        h: 0.3,
        fontSize: 11,
        color: 'E2E8F0',
        align: 'center',
        fontFace: 'Arial',
      });

      // Presentation Title card
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0,
        y: 1.6,
        w: 11.3,
        h: 2.8,
        fill: { color: cardBg },
        line: { color: accentColor, width: 2 },
        rectRadius: 0.1,
      });

      slide.addText('ALTERNATIVE ASSESSMENT TASK (AAT) PRESENTATION', {
        x: 1.2,
        y: 1.8,
        w: 10.9,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: accentColor,
        align: 'center',
        fontFace: 'Arial',
      });

      slide.addText(item.title.toUpperCase(), {
        x: 1.2,
        y: 2.3,
        w: 10.9,
        h: 1.2,
        fontSize: 26,
        bold: true,
        color: isDark ? 'FFFFFF' : primaryColor,
        align: 'center',
        fontFace: 'Arial',
      });

      slide.addText(item.subtitle || `Course: ${ppt.subjectName} (${ppt.courseCode})`, {
        x: 1.2,
        y: 3.6,
        w: 10.9,
        h: 0.4,
        fontSize: 14,
        color: textColor,
        align: 'center',
        fontFace: 'Arial',
      });

      // Presenter card
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0,
        y: 4.6,
        w: 11.3,
        h: 1.8,
        fill: { color: cardBg },
        rectRadius: 0.1,
      });

      slide.addText(
        [
          { text: 'Presented By: ', options: { bold: true, fontSize: 13, color: primaryColor } },
          { text: `${ppt.studentName}\n`, options: { bold: true, fontSize: 15, color: textColor } },
          { text: `Roll Number: ${ppt.rollNumber} | Branch: ${ppt.branch} (Sec: ${ppt.section})\n`, options: { fontSize: 12, color: textColor } },
          { text: `Department of ${ppt.branch} | Institute of Aeronautical Engineering`, options: { fontSize: 11, color: '64748B' } },
        ],
        {
          x: 1.3,
          y: 4.8,
          w: 10.7,
          h: 1.4,
          align: 'center',
          fontFace: 'Arial',
        }
      );
    } else {
      // Content Slide Header
      slide.addShape(pres.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 1.1,
        fill: { color: primaryColor },
      });

      slide.addText(item.title, {
        x: 0.8,
        y: 0.15,
        w: 10.5,
        h: 0.5,
        fontSize: 20,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial',
      });

      slide.addText(`IARE • ${ppt.courseCode} • ${ppt.subjectName}`, {
        x: 0.8,
        y: 0.65,
        w: 10.5,
        h: 0.3,
        fontSize: 11,
        color: 'E2E8F0',
        fontFace: 'Arial',
      });

      // Main content card
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y: 1.4,
        w: 11.7,
        h: 4.8,
        fill: { color: cardBg },
        rectRadius: 0.1,
      });

      // Bullets
      const bulletItems = (item.bullets || []).map((b) => ({
        text: `  ${b}\n\n`,
        options: {
          fontSize: 14,
          color: textColor,
          bullet: { code: '2022' },
          fontFace: 'Arial',
        },
      }));

      slide.addText(bulletItems, {
        x: 1.2,
        y: 1.7,
        w: 10.9,
        h: 3.5,
        fontFace: 'Arial',
      });

      // Key Takeaway box at bottom if available
      if (item.keyTakeaway) {
        slide.addShape(pres.ShapeType.roundRect, {
          x: 1.2,
          y: 5.3,
          w: 10.9,
          h: 0.65,
          fill: { color: isDark ? '334155' : 'EFF6FF' },
          line: { color: accentColor, width: 1 },
          rectRadius: 0.08,
        });

        slide.addText(`Key Takeaway: ${item.keyTakeaway}`, {
          x: 1.4,
          y: 5.35,
          w: 10.5,
          h: 0.55,
          fontSize: 11,
          bold: true,
          color: isDark ? 'FFFFFF' : primaryColor,
          fontFace: 'Arial',
        });
      }

      // Slide Footer
      slide.addText(`${ppt.studentName} (${ppt.rollNumber}) | Slide ${index + 1} of ${ppt.slides.length}`, {
        x: 0.8,
        y: 6.4,
        w: 11.7,
        h: 0.4,
        fontSize: 10,
        color: '94A3B8',
        align: 'right',
        fontFace: 'Arial',
      });
    }
  });

  await pres.writeFile({ fileName: `${ppt.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_AAT_Presentation.pptx` });
}
