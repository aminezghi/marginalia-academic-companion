import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// Optional server-side Gemini key. The rest of the app works without it.
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // Gemini API key status endpoint
  app.get('/api/gemini-status', (req, res) => {
    res.json({ 
      configured: !!apiKey,
      requiresKey: !apiKey,
      message: apiKey 
        ? 'Gemini API is configured and ready' 
        : 'Please add GEMINI_API_KEY to .env file to enable AI features. Get your free key at https://aistudio.google.com/'
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      apiConfigured: !!apiKey,
      message: apiKey 
        ? 'Gemini API key is configured' 
        : 'Please provide a GEMINI_API_KEY to use AI features. Get your key from https://aistudio.google.com/'
    });
  });

  // Real DOI Metadata Resolution Proxy (Crossref & OpenAlex)
  app.get('/api/doi', async (req, res) => {
    try {
      const doiRaw = (req.query.doi) || '';
      const doi = doiRaw.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();

      if (!doi) {
        return res.status(400).json({ error: 'DOI parameter is required' });
      }

      // Query Crossref public API with courteous header
      const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
      const response = await fetch(crossrefUrl, {
        headers: {
          'User-Agent': 'MarginaliaAcademicCompanion/1.0 (mailto:scholar@marginalia.academic)',
        },
      });

      if (!response.ok) {
        return res.status(response.status === 404 ? 404 : 502).json({
          success: false,
          error: response.status === 404
            ? 'Crossref does not have a record for this DOI.'
            : 'Crossref could not complete the lookup. Please try again later.',
        });
      }

      const data = await response.json();
      const item = data.message;

      // Normalize Crossref metadata
      const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled Work';
      const authors = Array.isArray(item.author)
        ? item.author.map((a) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean)
        : ['Unknown Author'];
      const year =
        item.published?.['date-parts']?.[0]?.[0]?.toString() ||
        item['published-print']?.['date-parts']?.[0]?.[0]?.toString() ||
        item['published-online']?.['date-parts']?.[0]?.[0]?.toString() ||
        new Date().getFullYear().toString();
      const journal = Array.isArray(item['container-title'])
        ? item['container-title'][0]
        : item['container-title'] || '';
      const volume = item.volume || '';
      const issue = item.issue || '';
      const pages = item.page || '';
      const abstract = item.abstract
        ? item.abstract.replace(/<[^>]+>/g, '').trim()
        : 'Abstract extracted via Crossref bibliographic registry.';
      const publisher = item.publisher || '';
      const type = item.type === 'journal-article' ? 'Journal Article' : item.type || 'Academic Paper';

      return res.json({
        success: true,
        data: {
          doi,
          title,
          authors: authors.length ? authors : ['Unknown Investigator'],
          year,
          journal,
          volume,
          issue,
          pages,
          abstract,
          publisher,
          type,
        },
      });
    } catch (err) {
      console.error('DOI resolver error:', err);
      return res.status(500).json({ error: err.message || 'Internal error resolving DOI' });
    }
  });

  // AI Streaming Research Assistant (SSE Token-by-Token)
  app.post('/api/ai/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    try {
      const { query, papers, mode = 'ask_library', contextNotes } = req.body;

      if (!ai) {
        res.write(`data: ${JSON.stringify({ error: 'Configure a Gemini API key in settings to enable real-time streaming synthesis.', code: 'API_KEY_REQUIRED' })}\n\n`);
        return res.end();
      }

      const papersContext = (papers || [])
        .map((p, idx) => {
          return `[Source ${idx + 1}] ID: ${p.id}
Title: ${p.title}
Authors: ${Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || 'Unknown'}
Year: ${p.year}
Type: ${p.type || 'Article'}
Journal: ${p.journal || p.institution || 'N/A'}
Category/Collection: ${p.category || 'General'}
Abstract: ${p.abstract || 'No abstract'}
Key Findings / Notes: ${(p.keyFindings || []).join('; ')}
Tags: ${(p.tags || []).join(', ')}`;
        })
        .join('\n\n---\n\n');

      let modeInstructions = '';
      if (mode === 'critique') {
        modeInstructions = `\nPerform a rigorous methodological critique:
- Internal & External Validity Assessment
- Sample Size, Sampling Strategy & Generalizability
- Potential Confounders & Analytical Biases
- Constructive Recommendations for Replicability`;
      } else if (mode === 'matrix') {
        modeInstructions = `\nGenerate an exhaustive Comparative Literature Matrix in Markdown table format comparing:
| Source & Year | Research Objective | Methodology & Sample | Core Findings | Limitations |`;
      } else if (mode === 'summarize') {
        modeInstructions = `\nProvide a structured academic synthesis:
- Core Problem Statement
- Empirical / Theoretical Methodology
- Principal Discoveries
- Epistemic Gaps & Future Trajectories`;
      } else {
        modeInstructions = `\nProvide an evidence-grounded answer addressing the user prompt directly, linking themes across sources.`;
      }

      const systemInstruction = `You are Marginalia, a specialized Academic Research Assistant.
You have access to the scholar's verified personal research library below.
Scientific Integrity & Grounding Protocols:
1. Every claim MUST be explicitly cited using [Source X: Author, Year] or (Author, Year).
2. Never invent citations, DOIs, statistics, or experiments not present in the provided library.
3. If the library does not contain sufficient evidence to answer the question, state: "The current library does not contain direct evidence for this query."
${modeInstructions}`;

      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\n=== VERIFIED RESEARCH LIBRARY (${papers?.length || 0} PAPERS) ===\n${papersContext}\n\n${contextNotes ? `=== USER RESEARCH NOTES ===\n${contextNotes}\n\n` : ''}=== SCHOLAR'S QUERY ===\n${query || 'Synthesize the selected literature.'}`,
            },
          ],
        },
      ];

      // Stream via @google/genai
      const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          temperature: 0.25,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err) {
      console.error('AI streaming error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream processing error' })}\n\n`);
      res.end();
    }
  });

  // AI Research Assistant (Powered by Gemini 2.5 Flash)
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { query, papers, mode = 'ask_library' } = req.body;

      if (!query && mode === 'ask_library') {
        return res.status(400).json({ error: 'Query is required' });
      }

      if (!ai) {
        return res.status(503).json({
          success: false,
          code: 'API_KEY_REQUIRED',
          error: 'Configure a Gemini API key to use the AI assistant.',
        });
      }

      // Format contextual library knowledge
      const papersContext = (papers || [])
        .map((p, idx) => {
          return `[Source ${idx + 1}] ID: ${p.id}
Title: ${p.title}
Authors: ${Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || 'Unknown'}
Year: ${p.year}
Type: ${p.type || 'Article'}
Journal: ${p.journal || p.institution || 'N/A'}
Category/Collection: ${p.category || 'General'}
Abstract: ${p.abstract || 'No abstract'}
Key Findings / Notes: ${(p.keyFindings || []).join('; ')}
Tags: ${(p.tags || []).join(', ')}`;
        })
        .join('\n\n---\n\n');

      let systemInstruction = `You are Marginalia, a specialized Academic Research Assistant.
You have access to the user's personal research library below.
Scientific Integrity Rules:
1. Every factual claim must cite specific sources from the library using "[Source X: Title, Year]".
2. Never invent citations, DOIs, authors, or experimental findings not substantiated in the context.
3. Clearly distinguish verified reported findings from your analytical interpretation.
4. If a topic is not discussed in the user's library, explicitly state: "This topic is not addressed in your current collection."`;

      if (mode === 'summarize') {
        systemInstruction += `\nProvide an exhaustive, structured academic synthesis:
- Core Research Problem & Objectives
- Methodology & Empirical Design
- Key Findings & Significance
- Limitations & Future Directions`;
      } else if (mode === 'compare') {
        systemInstruction += `\nConduct a comparative literature analysis:
- Shared Objectives & Divergent Hypotheses
- Methodological Differences (Sample, Tools, Paradigms)
- Convergent vs Contradictory Findings
- Research Gaps Identified`;
      } else if (mode === 'synthesis') {
        systemInstruction += `\nConstruct a publication-ready Literature Review Synthesis Outline with thematic headers, evidence mapping, and source attributions.`;
      }

      // If Gemini API is configured
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemInstruction}\n\n=== USER'S RESEARCH LIBRARY (${papers?.length || 0} PAPERS) ===\n${papersContext}\n\n=== USER PROMPT ===\n${query || 'Synthesize the selected literature.'}`,
                  },
                ],
              },
            ],
            config: {
              temperature: 0.3,
            },
          });

          const replyText = response.text || 'Unable to generate response.';
          return res.json({ success: true, answer: replyText });
        } catch (apiErr) {
          console.error('Gemini API request failed:', apiErr.message);
          return res.status(502).json({
            success: false,
            code: 'GEMINI_REQUEST_FAILED',
            error: 'Gemini could not answer this request. Check the API key and connection, then try again.',
          });
        }
      }

    } catch (err) {
      console.error('AI assistant endpoint error:', err);
      return res.status(500).json({ error: err.message || 'Internal AI error' });
    }
  });

export default app;
