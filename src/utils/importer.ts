// Bibliographic imports for BibTeX, RIS, and common Scopus / Web of Science CSV exports.

export interface ParsedRecord {
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  pageCount?: number;
  doi?: string;
  url?: string;
  abstract?: string;
  type?: string;
  keywords?: string[];
  publisher?: string;
}

const clean = (value: string) => value.trim().replace(/^\uFEFF/, '').replace(/[{}]/g, '').trim();
const normalizeDoi = (value: string) => clean(value).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '');
const splitAuthors = (value: string) => value.split(/\s+and\s+|\s*;\s*/i).map(clean).filter(Boolean);
function countNumberedPages(value: string): number | undefined {
  const range = value.match(/(?:^|\D)(\d+)\s*[-–—]+\s*(\d+)(?:$|\D)/);
  if (!range) return undefined;
  const first = Number(range[1]), last = Number(range[2]);
  return last >= first && last - first < 10000 ? last - first + 1 : undefined;
}

// BibTeX values can contain nested braces, quoted strings, or escaped commas.
function bibField(entry: string, field: string): string {
  const match = new RegExp(`\\b${field}\\s*=\\s*`, 'i').exec(entry);
  if (!match) return '';
  let index = match.index + match[0].length;
  while (/\s/.test(entry[index] || '')) index++;
  const opener = entry[index];
  if (opener === '{') {
    let depth = 1;
    const start = ++index;
    for (; index < entry.length && depth; index++) {
      if (entry[index] === '\\') { index++; continue; }
      if (entry[index] === '{') depth++;
      else if (entry[index] === '}') depth--;
    }
    return clean(entry.slice(start, depth ? index : index - 1).replace(/\s+/g, ' '));
  }
  if (opener === '"') {
    const start = ++index;
    for (; index < entry.length; index++) {
      if (entry[index] === '\\') { index++; continue; }
      if (entry[index] === '"') break;
    }
    return clean(entry.slice(start, index).replace(/\s+/g, ' '));
  }
  return clean(entry.slice(index).split(/[},\n]/, 1)[0]);
}

export function parseBibTeX(input: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const starts = [...input.matchAll(/@([a-zA-Z]+)\s*[({]/g)];
  for (let entryIndex = 0; entryIndex < starts.length; entryIndex++) {
    const start = starts[entryIndex].index ?? 0;
    const end = starts[entryIndex + 1]?.index ?? input.length;
    const entry = input.slice(start, end);
    const title = bibField(entry, 'title');
    if (!title) continue;
    const authors = splitAuthors(bibField(entry, 'author'));
    const doi = normalizeDoi(bibField(entry, 'doi'));
    records.push({
      title,
      authors: authors.length ? authors : ['Unknown Author'],
      year: bibField(entry, 'year').match(/\d{4}/)?.[0] || '',
      journal: bibField(entry, 'journal') || bibField(entry, 'journaltitle') || bibField(entry, 'booktitle') || undefined,
      volume: bibField(entry, 'volume') || undefined,
      issue: bibField(entry, 'number') || bibField(entry, 'issue') || undefined,
      pages: bibField(entry, 'pages') || undefined,
      pageCount: countNumberedPages(bibField(entry, 'pages')),
      doi: doi || undefined,
      url: bibField(entry, 'url') || bibField(entry, 'link') || (doi ? `https://doi.org/${doi}` : undefined),
      abstract: bibField(entry, 'abstract') || undefined,
      publisher: bibField(entry, 'publisher') || undefined,
      keywords: bibField(entry, 'keywords').split(/[,;]/).map(clean).filter(Boolean),
      type: starts[entryIndex][1].toLowerCase() === 'inproceedings' ? 'Conference Paper' : 'Journal Article',
    });
  }
  return records;
}

export function parseRIS(input: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const items = input.replace(/^\uFEFF/, '').split(/(?:^|\r?\n)ER\s+-\s*\r?\n?/i);
  for (const item of items) {
    const fields = new Map<string, string[]>();
    let lastTag = '';
    for (const line of item.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9]{2})\s+-\s+(.*)$/i);
      if (match) {
        lastTag = match[1].toUpperCase();
        fields.set(lastTag, [...(fields.get(lastTag) || []), match[2].trim()]);
      } else if (lastTag && /^\s{2,}\S/.test(line)) {
        const values = fields.get(lastTag)!;
        values[values.length - 1] += ` ${line.trim()}`;
      }
    }
    const get = (...tags: string[]) => tags.flatMap(tag => fields.get(tag) || []).join(' ').trim();
    const title = get('TI', 'T1');
    if (!title) continue;
    const doi = normalizeDoi(get('DO'));
    records.push({
      title, authors: get('AU', 'A1').split(/\s*;\s*/).filter(Boolean),
      year: (get('PY', 'Y1', 'DA').match(/\d{4}/) || [''])[0],
      journal: get('JO', 'JF', 'T2') || undefined, volume: get('VL') || undefined,
      issue: get('IS') || undefined,
      pages: [get('SP'), get('EP')].filter(Boolean).join('-') || get('PG') || undefined,
      pageCount: countNumberedPages([get('SP'), get('EP')].filter(Boolean).join('-') || get('PG')),
      doi: doi || undefined, url: get('UR') || (doi ? `https://doi.org/${doi}` : undefined),
      abstract: get('AB', 'N2') || undefined,
      keywords: [...(fields.get('KW') || []), ...(fields.get('DE') || [])],
      type: get('TY') || 'Journal Article',
    });
  }
  return records.map(record => ({ ...record, authors: record.authors.length ? record.authors : ['Unknown Author'] }));
}

// Web of Science "Plain Text" export uses two-letter field tags without RIS hyphens.
export function parseWebOfScienceText(input: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const entries = input.replace(/^\uFEFF/, '').split(/(?:^|\r?\n)ER\s*\r?\n?/i);
  for (const entry of entries) {
    const fields = new Map<string, string[]>();
    let lastTag = '';
    for (const line of entry.split(/\r?\n/)) {
      const match = line.match(/^([A-Z]{2})\s{1,3}(.*)$/);
      if (match) {
        lastTag = match[1].toUpperCase();
        fields.set(lastTag, [...(fields.get(lastTag) || []), match[2].trim()]);
      } else if (lastTag && /^\s+\S/.test(line)) {
        const values = fields.get(lastTag)!;
        values[values.length - 1] += ` ${line.trim()}`;
      }
    }
    const get = (...tags: string[]) => tags.flatMap(tag => fields.get(tag) || []).join(' ').trim();
    const title = get('TI');
    if (!title) continue;
    const doi = normalizeDoi(get('DI'));
    const pages = [get('BP'), get('EP')].filter(Boolean).join('-') || get('AR');
    const keywordText = [get('DE'), get('ID')].filter(Boolean).join(';');
    records.push({
      title, authors: (fields.get('AU') || []).map(clean).filter(Boolean),
      year: (get('PY').match(/\d{4}/) || [''])[0], journal: get('SO') || undefined,
      volume: get('VL') || undefined, issue: get('IS') || undefined, pages: pages || undefined,
      pageCount: countNumberedPages(pages), doi: doi || undefined,
      url: doi ? `https://doi.org/${doi}` : undefined,
      abstract: get('AB') || undefined,
      keywords: keywordText.split(';').map(clean).filter(Boolean),
      type: get('DT') || 'Journal Article',
    });
  }
  return records.map(record => ({ ...record, authors: record.authors.length ? record.authors : ['Unknown Author'] }));
}

// EndNote tagged exports (.enw) use percent-prefixed field names.
export function parseEndNoteTagged(input: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  let fields = new Map<string, string[]>();
  let lastTag = '';
  const finish = () => {
    const get = (...tags: string[]) => tags.flatMap(tag => fields.get(tag) || []).join(' ').trim();
    const title = get('T');
    if (title) {
      const doi = normalizeDoi(get('R'));
      const pages = get('P');
      records.push({
        title, authors: (fields.get('A') || []).map(clean).filter(Boolean),
        year: get('D').match(/\d{4}/)?.[0] || '', journal: get('J') || undefined,
        volume: get('V') || undefined, issue: get('N') || undefined, pages: pages || undefined,
        pageCount: countNumberedPages(pages), doi: doi || undefined,
        url: get('U') || (doi ? `https://doi.org/${doi}` : undefined),
        abstract: get('X') || undefined,
        keywords: (fields.get('K') || []).map(clean).filter(Boolean),
        type: get('0') || 'Journal Article',
      });
    }
    fields = new Map();
  };
  for (const line of input.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const match = line.match(/^%([A-Z0-9])\s+(.*)$/i);
    if (match) {
      const tag = match[1].toUpperCase();
      if (tag === '0' && fields.size) finish();
      lastTag = tag;
      fields.set(tag, [...(fields.get(tag) || []), match[2].trim()]);
    } else if (lastTag && /^\s+\S/.test(line)) {
      const values = fields.get(lastTag)!;
      values[values.length - 1] += ` ${line.trim()}`;
    }
  }
  finish();
  return records.map(record => ({ ...record, authors: record.authors.length ? record.authors : ['Unknown Author'] }));
}

// PubMed MEDLINE / NBIB export format (.nbib, .medline, or PubMed .txt)
export function parsePubMedMedline(input: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const entries = input.replace(/^\uFEFF/, '').split(/(?:^|\r?\n)(?=PMID\s*-\s*\d+)/i);
  for (const entry of entries) {
    if (!entry.trim() || !/PMID\s*-\s*\d+/i.test(entry)) continue;
    const fields = new Map<string, string[]>();
    let lastTag = '';
    for (const line of entry.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9]{2,4})\s*-\s*(.*)$/);
      if (match) {
        lastTag = match[1].toUpperCase();
        fields.set(lastTag, [...(fields.get(lastTag) || []), match[2].trim()]);
      } else if (lastTag && /^\s{1,8}\S/.test(line)) {
        const values = fields.get(lastTag)!;
        values[values.length - 1] += ` ${line.trim()}`;
      }
    }
    const get = (...tags: string[]) => tags.flatMap(t => fields.get(t) || []).join(' ').trim();
    const title = get('TI', 'BTI');
    if (!title) continue;

    // Authors: FAU (Full Author Name) preferred over AU (abbreviated)
    const authors = (fields.get('FAU') || fields.get('AU') || []).map(clean).filter(Boolean);

    // Year: DP (Date of Publication) e.g. "2023 Apr 15" or "2023"
    const yearMatch = get('DP', 'DEP', 'DA').match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '';

    // Journal: JT (Full Journal Title) or TA (Journal Abbreviation)
    const journal = get('JT', 'TA') || undefined;

    // Volume, Issue, Pages: VI, IP, PG
    const volume = get('VI') || undefined;
    const issue = get('IP') || undefined;
    const pages = get('PG') || undefined;

    // DOI: LID or AID with [doi]
    let doi: string | undefined;
    const allIds = [...(fields.get('LID') || []), ...(fields.get('AID') || [])];
    for (const id of allIds) {
      if (/\[doi\]/i.test(id) || /^10\.\d{4,9}\//.test(id)) {
        doi = normalizeDoi(id.replace(/\s*\[doi\]/i, '').trim());
        break;
      }
    }

    // Abstract: AB
    const abstract = get('AB') || undefined;

    // Keywords: OT (Other Terms) and MH (MeSH Terms)
    const keywords = [
      ...(fields.get('OT') || []),
      ...(fields.get('MH') || []).map(m => m.replace(/\*/g, '').split('/')[0].trim()),
    ].map(clean).filter(Boolean);

    // Type: PT (Publication Type)
    const type = (fields.get('PT') || [])[0] || 'Journal Article';

    records.push({
      title,
      authors: authors.length ? authors : ['Unknown Author'],
      year,
      journal,
      volume,
      issue,
      pages,
      pageCount: countNumberedPages(pages || ''),
      doi: doi || undefined,
      url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${get('PMID')}/`,
      abstract,
      keywords: Array.from(new Set(keywords)),
      type,
    });
  }
  return records;
}

// RFC 4180 style CSV/TSV reader (quotes, escaped quotes, and multiline cells).
function parseDelimited(input: string): string[][] {
  const sample = input.slice(0, 4096);
  const delimiter = (sample.match(/\t/g)?.length || 0) > (sample.match(/,/g)?.length || 0) ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  const text = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (!quoted && char === delimiter) { row.push(cell.trim()); cell = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some(value => value)) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(value => value)) rows.push(row);
  return rows;
}

export function parseCSV(input: string): ParsedRecord[] {
  const rows = parseDelimited(input);
  if (rows.length < 2) return [];
  const headers = rows[0].map(header => clean(header).toLowerCase().replace(/[_-]+/g, ' '));
  const find = (...names: string[]) => headers.findIndex(header => names.some(name => header === name || header.includes(name)));
  const titleIndex = find('article title', 'document title', 'title', 'ti');
  if (titleIndex < 0) return [];
  const index = {
    authors: find('author full names', 'authors', 'author(s)', 'first author', 'author'),
    year: find('publication year', 'year', 'date', 'pub year'),
    journal: find('source title', 'journal/book', 'journal title', 'journal', 'publication name', 'publication', 'so'),
    volume: find('volume', 'vol'),
    issue: find('issue', 'number', 'is'),
    pageCount: find('page count'),
    start: find('beginning page', 'page start', 'start page', 'bp'),
    end: find('ending page', 'page end', 'end page', 'ep'),
    pages: find('pages', 'page range', 'citation'),
    doi: find('doi', 'digital object identifier', 'di'),
    url: find('doi link', 'link', 'url', 'document url', 'article url'),
    abstract: find('abstract', 'abstract text', 'ab'),
    keywords: find('author keywords', 'keywords plus', 'keywords', 'de', 'id'),
    publisher: find('publisher'),
    type: find('publication type', 'document type', 'type', 'dt'),
  };
  const at = (row: string[], key: keyof typeof index) => index[key] >= 0 ? (row[index[key]] || '').trim() : '';
  return rows.slice(1).flatMap(row => {
    const title = (row[titleIndex] || '').trim();
    if (!title) return [];
    const doi = normalizeDoi(at(row, 'doi'));
    const authorsRaw = at(row, 'authors');
    let authors: string[] = [];
    if (authorsRaw.includes(';') || authorsRaw.includes('|')) {
      authors = authorsRaw.split(/\s*;\s*|\|/).map(clean).filter(Boolean);
    } else if (authorsRaw.includes(',')) {
      authors = authorsRaw.split(/\s*,\s*/).map(clean).filter(Boolean);
    } else if (authorsRaw) {
      authors = [clean(authorsRaw)];
    }
    const start = at(row, 'start'), end = at(row, 'end');
    const pageText = at(row, 'pages') || (start ? `${start}${end ? `-${end}` : ''}` : '');
    const declaredPageCount = Number(at(row, 'pageCount'));
    return [{
      title,
      authors: authors.length ? authors : ['Unknown Author'],
      year: at(row, 'year').match(/\d{4}/)?.[0] || '',
      journal: at(row, 'journal') || undefined,
      volume: at(row, 'volume') || undefined,
      issue: at(row, 'issue') || undefined,
      pages: pageText || undefined,
      pageCount: declaredPageCount > 0 ? declaredPageCount : countNumberedPages(pageText),
      doi: doi || undefined,
      url: at(row, 'url') || (doi ? `https://doi.org/${doi}` : undefined),
      abstract: at(row, 'abstract') || undefined,
      keywords: at(row, 'keywords').split(/[;|]/).map(clean).filter(Boolean),
      publisher: at(row, 'publisher') || undefined,
      type: at(row, 'type') || 'Journal Article',
    }];
  });
}

export function parseBibliographyFile(filename: string, content: string): ParsedRecord[] {
  const extension = filename.toLowerCase().split('.').pop();
  if (extension === 'bib' || (content.includes('@') && content.includes('{'))) return parseBibTeX(content);
  if (extension === 'nbib' || extension === 'medline' || /(?:^|\n)PMID\s*-\s*\d+/i.test(content)) return parsePubMedMedline(content);
  if (extension === 'ciw' || (/(?:^|\n)PT\s{1,3}J\b/i.test(content) && /(?:^|\n)TI\s{1,3}/i.test(content))) return parseWebOfScienceText(content);
  if (extension === 'enw' || /(?:^|\n)%0\s+/i.test(content)) return parseEndNoteTagged(content);
  if (extension === 'ris' || /(?:^|\n)TY\s+-/i.test(content)) return parseRIS(content);
  return parseCSV(content);
}
