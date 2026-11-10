import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  generateAatPpt,
  generateAatAssignment,
  generateProjectReport,
  generateCaseStudy,
  regenerateSection,
} from './src/server/geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { action, payload } = req.body;
    let result;

    switch (action) {
      case 'aat_ppt':
        result = await generateAatPpt(payload);
        break;
      case 'aat_assignment':
        result = await generateAatAssignment(payload);
        break;
      case 'project_report':
        result = await generateProjectReport(payload);
        break;
      case 'case_study':
        result = await generateCaseStudy(payload);
        break;
      case 'regenerate_section':
        result = await regenerateSection(payload);
        break;
      default:
        res.status(400).json({ success: false, error: `Invalid action: ${action}` });
        return;
    }

    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('API Error:', err);
    res.status(500).json({ success: false, error: message });
  }
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`IARE Smart Academic AI server running on port ${PORT}`);
});
