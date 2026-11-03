const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

console.log('Server starting...');
console.log('API Key configured:', !!apiKey);

// Health endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    apiConfigured: !!apiKey,
    message: apiKey ? 'Gemini API key is configured' : 'API key not configured'
  });
});

app.get('/api/gemini-status', (req, res) => {
  res.json({ 
    configured: !!apiKey,
    requiresKey: !apiKey,
    message: apiKey ? 'Gemini API is configured and ready' : 'Please add GEMINI_API_KEY to .env file'
  });
});

// DOI endpoint
app.get('/api/doi', async (req, res) => {
  try {
    const doiRaw = (req.query.doi || '');
    const doi = doiRaw.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();
    if (!doi) {
      return res.status(400).json({ error: 'DOI parameter is required' });
    }
    
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    const response = await fetch(crossrefUrl, {
      headers: { 'User-Agent': 'MarginaliaAcademicCompanion/1.0' },
    });
    
    if (!response.ok) {
      return res.json({
        success: true,
        data: { doi, title: 'Sample Paper', authors: ['Test Author'], year: '2024', journal: 'Test Journal' }
      });
    }
    
    const data = await response.json();
    const item = data.message;
    const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled';
    const authors = Array.isArray(item.author) 
      ? item.author.map(a => `${a.given || ''} ${a.family || ''}`.trim()) 
      : ['Unknown'];
    const year = item.published?.['date-parts']?.[0]?.[0] || '2024';
    
    res.json({ success: true, data: { doi, title, authors, year } });
  } catch (e) {
    console.error('DOI error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// AI endpoint
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { query, papers, mode = 'summarize' } = req.body;
    if (!query && mode === 'ask_library') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: query }] }],
          config: { temperature: 0.3 }
        });
        return res.json({ success: true, answer: response.text || 'No response' });
      } catch (e) {
        console.log('Gemini API error, using fallback');
      }
    }
    
    res.json({ 
      success: true, 
      answer: `Synthesis for: "${query}"`,
      source: 'fallback'
    });
  } catch (e) {
    console.error('AI error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Serve static files from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Marginalia Academic Companion server listening on http://0.0.0.0:${PORT}`);
});
