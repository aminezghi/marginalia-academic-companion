const { once } = require('node:events');
const http = require('node:http');
const { createBackend } = require('../desktop/backend.cjs');

function requestJson(baseUrl, pathname, { method = 'GET', body } = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(new URL(pathname, baseUrl), {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    }, (response) => {
      let content = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { content += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, json: JSON.parse(content) }));
    });
    request.once('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

describe('Desktop backend API', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const { app } = createBackend();
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  afterEach(() => jest.restoreAllMocks());

  test('AI status is locked without a key and asks return no fabricated synthesis', async () => {
    const statusResponse = await requestJson(baseUrl, '/api/gemini-status');
    expect(statusResponse.json).toMatchObject({ configured: false, requiresKey: true });

    const response = await requestJson(baseUrl, '/api/ai/ask', {
      method: 'POST',
      body: { query: 'Summarize the library', papers: [] },
    });
    expect(response.status).toBe(503);
    expect(response.json).toMatchObject({ success: false, code: 'API_KEY_REQUIRED' });
  });

  test('invalid DOI input is rejected without contacting Crossref', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const response = await requestJson(baseUrl, '/api/doi?doi=not-a-doi');
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('a DOI missing from Crossref returns not found, not made-up metadata', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 404 });
    const response = await requestJson(baseUrl, '/api/doi?doi=10.1234%2Fmissing-record');
    expect(response.status).toBe(404);
    expect(response.json).toMatchObject({ success: false });
  });

  test('a DOI lookup maps real Crossref metadata into the import shape', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: {
          title: ['A Real Research Paper'],
          author: [{ given: 'Ada', family: 'Lovelace' }],
          published: { 'date-parts': [[2024, 5, 1]] },
          'container-title': ['Journal of Verified Findings'],
          publisher: 'Verified Publisher',
          type: 'journal-article',
        },
      }),
    });
    const response = await requestJson(baseUrl, '/api/doi?doi=10.1234%2Fverified-record');
    expect(response.status).toBe(200);
    expect(response.json).toMatchObject({
      success: true,
      data: {
        doi: '10.1234/verified-record',
        title: 'A Real Research Paper',
        authors: ['Ada Lovelace'],
        year: '2024',
      },
    });
  });
});
