const express = require('express');
const path = require('node:path');
const { GoogleGenAI } = require('@google/genai');

const DOI_USER_AGENT = 'MarginaliaAcademicCompanion/1.0 (mailto:scholar@marginalia.academic)';

function createBackend({ distPath, apiKey = '' } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '20mb' }));

  let activeApiKey = apiKey;
  let ai = activeApiKey ? new GoogleGenAI({ apiKey: activeApiKey }) : null;

  function setGeminiApiKey(nextKey) {
    const normalizedKey = typeof nextKey === 'string' ? nextKey.trim() : '';
    if (!normalizedKey) throw new Error('Enter a Gemini API key.');
    activeApiKey = normalizedKey;
    ai = new GoogleGenAI({ apiKey: activeApiKey });
  }

  app.get('/api/gemini-status', (_req, res) => {
    res.json({
      configured: Boolean(activeApiKey),
      requiresKey: !activeApiKey,
      message: activeApiKey ? 'Gemini API is configured and ready' : 'Configure a Gemini API key to use AI features.',
    });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', apiConfigured: Boolean(activeApiKey) });
  });

  app.get('/api/doi', async (req, res) => {
    const rawDoi = typeof req.query.doi === 'string' ? req.query.doi : '';
    const doi = rawDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();
    if (!doi) return res.status(400).json({ success: false, error: 'DOI parameter is required.' });
    if (!/^10\.\d{4,9}\/\S+$/i.test(doi)) {
      return res.status(400).json({ success: false, error: 'Enter a valid DOI.' });
    }

    try {
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
        headers: { 'User-Agent': DOI_USER_AGENT },
        signal: AbortSignal.timeout(12000),
      });
      if (response.status === 404) {
        return res.status(404).json({ success: false, error: 'Crossref does not have a record for this DOI.' });
      }
      if (!response.ok) {
        return res.status(502).json({ success: false, error: 'Crossref could not complete the lookup. Please try again later.' });
      }

      const payload = await response.json();
      const item = payload && payload.message;
      if (!item || typeof item !== 'object') {
        return res.status(502).json({ success: false, error: 'Crossref returned an unreadable metadata record.' });
      }
      const firstDatePart = (...fields) => {
        for (const field of fields) {
          const year = field && field['date-parts'] && field['date-parts'][0] && field['date-parts'][0][0];
          if (year) return String(year);
        }
        return '';
      };
      const authors = Array.isArray(item.author)
        ? item.author.map((author) => [author.given, author.family].filter(Boolean).join(' ')).filter(Boolean)
        : [];
      return res.json({
        success: true,
        data: {
          doi,
          title: Array.isArray(item.title) ? item.title[0] || '' : item.title || '',
          authors: authors.length ? authors : ['Unknown Author'],
          year: firstDatePart(item.published, item['published-print'], item['published-online']),
          journal: Array.isArray(item['container-title']) ? item['container-title'][0] || '' : item['container-title'] || '',
          volume: item.volume || '',
          issue: item.issue || '',
          pages: item.page || '',
          abstract: item.abstract ? item.abstract.replace(/<[^>]*>/g, '').trim() : '',
          publisher: item.publisher || '',
          type: item.type === 'journal-article' ? 'Journal Article' : item.type || 'Academic Paper',
        },
      });
    } catch (error) {
      console.error('Crossref DOI lookup failed:', error instanceof Error ? error.message : 'unknown error');
      return res.status(502).json({ success: false, error: 'Could not reach Crossref. Check your internet connection and retry.' });
    }
  });

  app.post('/api/ai/ask', async (req, res) => {
    const { query, papers, mode = 'ask_library' } = req.body || {};
    if (!activeApiKey || !ai) {
      return res.status(503).json({
        success: false,
        code: 'API_KEY_REQUIRED',
        error: 'Configure a Gemini API key to use the AI assistant.',
      });
    }
    if (typeof query !== 'string' && mode === 'ask_library') {
      return res.status(400).json({ success: false, error: 'A research question is required.' });
    }
    if (papers !== undefined && !Array.isArray(papers)) {
      return res.status(400).json({ success: false, error: 'The papers field must be a list.' });
    }

    const safePapers = (Array.isArray(papers) ? papers : []).slice(0, 100);
    const papersContext = safePapers.map((paper, index) => {
      const authors = Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors || 'Unknown';
      const findings = Array.isArray(paper.keyFindings) ? paper.keyFindings.join('; ') : '';
      const tags = Array.isArray(paper.tags) ? paper.tags.join(', ') : '';
      return `[Source ${index + 1}]\nTitle: ${paper.title || 'Untitled'}\nAuthors: ${authors}\nYear: ${paper.year || ''}\nJournal: ${paper.journal || paper.institution || ''}\nCollection: ${paper.category || ''}\nAbstract: ${paper.abstract || ''}\nNotes: ${findings}\nTags: ${tags}`;
    }).join('\n\n---\n\n');

    let instructions = `You are Marginalia, an academic research assistant. Use only the supplied library context for claims about the user's papers. Cite each such claim as [Source X: Title, Year]. Never invent citations, DOIs, authors, or findings. Separate reported evidence from interpretation. If the collection does not address a topic, say so explicitly.`;
    if (mode === 'summarize') instructions += '\nStructure the response as research problem, methods, findings, limitations, and future directions.';
    if (mode === 'compare') instructions += '\nCompare objectives, methods, findings, limitations, and research gaps.';
    if (mode === 'synthesis') instructions += '\nCreate a literature review outline with thematic headings and source attributions.';

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{
          role: 'user',
          parts: [{ text: `${instructions}\n\n=== LIBRARY (${safePapers.length} PAPERS) ===\n${papersContext}\n\n=== QUESTION ===\n${query || 'Synthesize the selected literature.'}` }],
        }],
        config: { temperature: 0.3 },
      });
      const answer = result.text || '';
      if (!answer.trim()) return res.status(502).json({ success: false, code: 'EMPTY_AI_RESPONSE', error: 'Gemini returned an empty response. Please try again.' });
      return res.json({ success: true, answer });
    } catch (error) {
      console.error('Gemini API request failed:', error instanceof Error ? error.message : 'unknown error');
      return res.status(502).json({
        success: false,
        code: 'GEMINI_REQUEST_FAILED',
        error: 'Gemini could not answer this request. Check the API key and connection, then try again.',
      });
    }
  });

  if (distPath) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  return { app, setGeminiApiKey };
}

module.exports = { createBackend };
