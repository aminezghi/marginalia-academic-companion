// Comprehensive Bibliographic Parsing & Import Utilities (BibTeX, RIS, CSV, DOI)

export interface ParsedRecord {
  title: string;
  authors: string[];
  year: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  abstract?: string;
  type?: string;
  keywords?: string[];
  publisher?: string;
}

// Parse BibTeX text content
export function parseBibTeX(bibtexText: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const entries = bibtexText.split(/@(?=[a-zA-Z]+[\s\t]*\{)/g);

  for (const entry of entries) {
    if (!entry.trim()) continue;
    try {
      const typeMatch = entry.match(/^([a-zA-Z]+)[\s\t]*\{/);
      const entryType = typeMatch ? typeMatch[1].toLowerCase() : 'article';

      const getField = (field: string): string => {
        const regex = new RegExp(`${field}[\\s\\t]*=[\\s\\t]*[{"']([\\s\\S]*?)[}"'],?`, 'i');
        const match = entry.match(regex);
        return match ? match[1].replace(/[\r\n\t]+/g, ' ').trim() : '';
      };

      const title = getField('title');
      if (!title) continue;

      const authorStr = getField('author');
      const authors = authorStr
        ? authorStr
            .split(/\s+and\s+/i)
            .map((a) => a.trim().replace(/[{}]/g, ''))
            .filter(Boolean)
        : ['Unknown Author'];

      const year = getField('year') || new Date().getFullYear().toString();
      const journal = getField('journal') || getField('booktitle') || '';
      const volume = getField('volume');
      const issue = getField('number') || getField('issue');
      const pages = getField('pages');
      const doi = getField('doi');
      const abstract = getField('abstract');
      const publisher = getField('publisher');
      const keywords = getField('keywords')
        ? getField('keywords')
            .split(/[,;]/)
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      records.push({
        title: title.replace(/[{}]/g, ''),
        authors,
        year,
        journal,
        volume,
        issue,
        pages,
        doi,
        abstract,
        publisher,
        keywords,
        type: entryType === 'article' ? 'Journal Article' : entryType === 'inproceedings' ? 'Conference Paper' : 'Book / Chapter',
      });
    } catch {
      // Continue next entry
    }
  }

  return records;
}

// Parse RIS format text
export function parseRIS(risText: string): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const items = risText.split(/ER\s+-/g);

  for (const item of items) {
    if (!item.trim()) continue;
    const lines = item.split(/\r?\n/);
    let title = '';
    const authors: string[] = [];
    let year = '';
    let journal = '';
    let volume = '';
    let issue = '';
    let pages = '';
    let doi = '';
    let abstract = '';
    const keywords: string[] = [];

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9]{2})\s+-\s+(.*)$/);
      if (!match) continue;
      const tag = match[1];
      const val = match[2].trim();

      if (tag === 'TI' || tag === 'T1') title = val;
      else if (tag === 'AU' || tag === 'A1') authors.push(val);
      else if (tag === 'PY' || tag === 'Y1') year = val.slice(0, 4);
      else if (tag === 'JO' || tag === 'JF' || tag === 'T2') journal = val;
      else if (tag === 'VL') volume = val;
      else if (tag === 'IS') issue = val;
      else if (tag === 'SP') pages = val;
      else if (tag === 'DO') doi = val;
      else if (tag === 'AB' || tag === 'N2') abstract = val;
      else if (tag === 'KW') keywords.push(val);
    }

    if (title) {
      records.push({
        title,
        authors: authors.length ? authors : ['Unknown Author'],
        year: year || new Date().getFullYear().toString(),
        journal,
        volume,
        issue,
        pages,
        doi,
        abstract,
        keywords,
        type: 'Journal Article',
      });
    }
  }

  return records;
}

// Parse simple CSV bibliographic text
export function parseCSV(csvText: string): ParsedRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map((h) => h.replace(/["']/g, '').trim().toLowerCase());
  const records: ParsedRecord[] = [];

  const titleIdx = headers.findIndex((h) => h.includes('title'));
  const authorIdx = headers.findIndex((h) => h.includes('author'));
  const yearIdx = headers.findIndex((h) => h.includes('year') || h.includes('date'));
  const journalIdx = headers.findIndex((h) => h.includes('journal') || h.includes('source') || h.includes('publication'));
  const doiIdx = headers.findIndex((h) => h.includes('doi'));
  const abstractIdx = headers.findIndex((h) => h.includes('abstract'));

  for (let i = 1; i < lines.length; i++) {
    // Basic comma splitter respecting quotes
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanRow = row.map((c) => c.replace(/^"|"$/g, '').trim());

    const title = titleIdx !== -1 ? cleanRow[titleIdx] : cleanRow[0];
    if (!title) continue;

    const authorStr = authorIdx !== -1 ? cleanRow[authorIdx] : '';
    const authors = authorStr ? authorStr.split(/[;]/).map((a) => a.trim()) : ['Investigator'];
    const year = yearIdx !== -1 ? cleanRow[yearIdx] : new Date().getFullYear().toString();
    const journal = journalIdx !== -1 ? cleanRow[journalIdx] : '';
    const doi = doiIdx !== -1 ? cleanRow[doiIdx] : '';
    const abstract = abstractIdx !== -1 ? cleanRow[abstractIdx] : '';

    records.push({
      title,
      authors,
      year: year.slice(0, 4),
      journal,
      doi,
      abstract,
      type: 'Journal Article',
    });
  }

  return records;
}
