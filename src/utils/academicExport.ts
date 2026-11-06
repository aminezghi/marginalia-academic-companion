import JSZip from 'jszip';
import { ResearchItem, ResearchCollection, ResearchNote, Highlight } from '../types/research';

/**
 * Normalizes title or author to create a standard BibTeX citekey (e.g. "zouaghi2026mapping").
 */
export function generateCiteKey(paper: ResearchItem): string {
  const authorsList = Array.isArray(paper.authors) ? paper.authors : [];
  const firstAuthor = authorsList.length > 0 ? authorsList[0] : 'Scholar';
  
  const lastName = firstAuthor.trim().split(/\s+/).pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'author';
  const year = paper.year ? paper.year.replace(/[^0-9]/g, '').slice(0, 4) : 'nd';
  const firstWord = paper.title
    ? paper.title
        .toLowerCase()
        .replace(/^(the|a|an)\s+/i, '')
        .split(/\s+/)[0]
        ?.replace(/[^a-z0-9]/g, '') || 'work'
    : 'item';

  return `${lastName}${year}${firstWord}`;
}

/**
 * Formats an individual paper into a pristine standard BibTeX entry.
 */
export function generateBibtex(paper: ResearchItem): string {
  const citeKey = generateCiteKey(paper);
  const entryType = (paper.type || '').toLowerCase().includes('book')
    ? 'book'
    : (paper.type || '').toLowerCase().includes('conference')
      ? 'inproceedings'
      : 'article';

  const authorsFormatted = Array.isArray(paper.authors)
    ? paper.authors.join(' and ')
    : paper.authors || 'Unknown';

  const fields: [string, string | undefined][] = [
    ['title', paper.title ? `{${paper.title}}` : undefined],
    ['author', `{${authorsFormatted}}`],
    ['year', paper.year || undefined],
    ['journal', paper.journal ? `{${paper.journal}}` : undefined],
    ['volume', paper.volume || undefined],
    ['number', paper.issue || undefined],
    ['pages', paper.pages ? `{${paper.pages}}` : undefined],
    ['doi', paper.doi || undefined],
    ['url', paper.doi ? `https://doi.org/${paper.doi}` : paper.url || undefined],
    ['abstract', paper.abstract ? `{${paper.abstract}}` : undefined],
    ['keywords', Array.isArray(paper.tags) && paper.tags.length > 0 ? `{${paper.tags.join(', ')}}` : undefined],
  ];

  const fieldLines = fields
    .filter(([, val]) => Boolean(val))
    .map(([key, val]) => `  ${key.padEnd(10, ' ')} = ${val},`)
    .join('\n');

  return `@${entryType}{${citeKey},\n${fieldLines}\n}`;
}

/**
 * Generates a master BibTeX database for an array of research papers.
 */
export function exportMasterBibtex(papers: ResearchItem[]): string {
  const header = `% Marginalia Academic Knowledge Companion - Master Bibliography\n% Exported: ${new Date().toISOString()}\n% Total entries: ${papers.length}\n\n`;
  return header + papers.map(generateBibtex).join('\n\n');
}

/**
 * Generates styled standard academic citations (APA 7th, Chicago 17th, Harvard, MLA 9th).
 */
export function generateCitationText(
  paper: ResearchItem,
  format: 'apa' | 'chicago' | 'harvard' | 'mla' | 'bibtex'
): string {
  if (format === 'bibtex') {
    return generateBibtex(paper);
  }

  const authorsList = Array.isArray(paper.authors)
    ? paper.authors
    : typeof paper.authors === 'string'
      ? [paper.authors]
      : ['Unknown Author'];

  const year = paper.year || 'n.d.';
  const title = paper.title || 'Untitled Work';
  const journal = paper.journal || '';
  const volume = paper.volume ? ` ${paper.volume}` : '';
  const issue = paper.issue ? `(${paper.issue})` : '';
  const pages = paper.pages ? `: ${paper.pages}` : '';
  const doi = paper.doi ? ` https://doi.org/${paper.doi}` : '';

  // Author formatting
  const formatAuthorName = (name: string, reverse = true) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    const last = parts.pop();
    const initials = parts.map((p) => `${p[0]}.`).join(' ');
    return reverse ? `${last}, ${initials}` : `${initials} ${last}`;
  };

  if (format === 'apa') {
    // APA 7th: Author, A. A., & Author, B. B. (Year). Title of article. Title of Periodical, xx(x), pp-pp. https://doi.org/xxxx
    const authorsStr = authorsList.length === 1
      ? formatAuthorName(authorsList[0])
      : authorsList.length === 2
        ? `${formatAuthorName(authorsList[0])}, & ${formatAuthorName(authorsList[1])}`
        : `${formatAuthorName(authorsList[0])}, et al.`;
    return `${authorsStr} (${year}). ${title}.${journal ? ` ${journal},${volume}${issue}${pages}.` : ''}${doi}`;
  }

  if (format === 'chicago') {
    // Chicago Notes & Bibliography: Author, Firstname. "Title." Journal vol, no. iss (Year): pp-pp.
    const authorsStr = authorsList.length === 1
      ? authorsList[0]
      : authorsList.length === 2
        ? `${authorsList[0]} and ${authorsList[1]}`
        : `${authorsList[0]} et al.`;
    return `${authorsStr}. "${title}."${journal ? ` ${journal}${volume}${issue ? `, no. ${paper.issue}` : ''} (${year})${pages}.` : ` (${year}).`}${doi}`;
  }

  if (format === 'harvard') {
    // Harvard: Author, A.A., Year. Title of article. Title of journal, volume(issue), pp.pages.
    const authorsStr = authorsList.map((a) => formatAuthorName(a)).join(', ');
    return `${authorsStr}, ${year}. ${title}.${journal ? ` ${journal},${volume}${issue}, pp.${paper.pages || ''}.` : ''}${doi}`;
  }

  // MLA 9th: Author. "Title." Journal, vol. x, no. x, Year, pp. x-x.
  const mlaAuthor = authorsList.length === 1
    ? formatAuthorName(authorsList[0])
    : authorsList.length === 2
      ? `${formatAuthorName(authorsList[0])}, and ${authorsList[1]}`
      : `${formatAuthorName(authorsList[0])}, et al.`;
  return `${mlaAuthor}. "${title}."${journal ? ` ${journal},${paper.volume ? ` vol. ${paper.volume},` : ''}${paper.issue ? ` no. ${paper.issue},` : ''} ${year}${paper.pages ? `, pp. ${paper.pages}` : ''}.` : ` ${year}.`}${doi}`;
}

/**
 * Packages the scholar's entire library into a rich, interconnected Obsidian / Zotero Markdown Vault (.zip).
 */
export async function exportObsidianVault(
  papers: ResearchItem[],
  collections: ResearchCollection[],
  notes: ResearchNote[],
  highlights: Highlight[]
): Promise<Blob> {
  const zip = new JSZip();

  // Root Readme / Index
  let indexMd = `# 🏛️ Marginalia Academic Vault\n\n`;
  indexMd += `**Export Date:** ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}\n`;
  indexMd += `**Total Papers:** ${papers.length} | **Collections:** ${collections.length} | **Notes:** ${notes.length}\n\n`;
  indexMd += `Welcome to your academic knowledge vault. Every paper is mapped as a discrete note with YAML metadata, annotations, and bi-directional wikilinks.\n\n`;

  indexMd += `## 📚 Research Collections\n`;
  for (const col of collections) {
    const colPapers = papers.filter((p) => p.collectionIds?.includes(col.id));
    indexMd += `- [[Collections/${col.name.replace(/[/\\?%*:|"<>]/g, '_')}|${col.name}]] (${colPapers.length} papers)\n`;
  }

  indexMd += `\n## 📄 Recent Papers\n`;
  for (const paper of papers.slice(0, 20)) {
    const safeTitle = paper.title.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 80);
    indexMd += `- [[Papers/${safeTitle}|${paper.title}]] (${paper.year || 'n.d.'})\n`;
  }

  zip.file('Marginalia Index.md', indexMd);

  // 1. Papers Folder
  const papersFolder = zip.folder('Papers');
  for (const paper of papers) {
    const safeTitle = paper.title.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 80);
    const paperHighlights = highlights.filter((h) => h.paperId === paper.id);
    const paperNotes = notes.filter((n) => n.paperIds?.includes(paper.id));
    const citeKey = generateCiteKey(paper);

    let md = `---\n`;
    md += `title: "${paper.title.replace(/"/g, '\\"')}"\n`;
    md += `authors: [${(Array.isArray(paper.authors) ? paper.authors : [paper.authors || '']).map((a) => `"${a}"`).join(', ')}]\n`;
    md += `year: ${paper.year || ''}\n`;
    md += `citekey: ${citeKey}\n`;
    if (paper.doi) md += `doi: ${paper.doi}\n`;
    if (paper.journal) md += `journal: "${paper.journal.replace(/"/g, '\\"')}"\n`;
    md += `status: ${paper.readingStatus || 'unread'}\n`;
    if (paper.tags?.length) md += `tags: [${paper.tags.map((t) => `"${t}"`).join(', ')}]\n`;
    md += `---\n\n`;

    md += `# ${paper.title}\n\n`;
    md += `> **Authors:** ${Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}  \n`;
    md += `> **Year:** ${paper.year || 'n.d.'} | **Journal:** ${paper.journal || 'N/A'}  \n`;
    if (paper.doi) md += `> **DOI:** [${paper.doi}](https://doi.org/${paper.doi})  \n`;
    md += `> **Citekey:** \`@${citeKey}\`\n\n`;

    md += `## Abstract\n${paper.abstract || 'No abstract recorded.'}\n\n`;

    if (paper.keyFindings?.length) {
      md += `## Key Findings\n`;
      paper.keyFindings.forEach((kf) => {
        md += `- ${kf}\n`;
      });
      md += `\n`;
    }

    if (paperHighlights.length > 0) {
      md += `## Annotations & Marginalia (${paperHighlights.length})\n`;
      paperHighlights.forEach((h) => {
        md += `> "${h.text}"\n`;
        if (h.note) md += `↳ *Note:* ${h.note}\n`;
        if (h.pageNumber) md += `*(Page ${h.pageNumber})*\n\n`;
        else md += `\n`;
      });
    }

    if (paperNotes.length > 0) {
      md += `## Linked Research Notes\n`;
      paperNotes.forEach((n) => {
        md += `### ${n.title}\n${n.content}\n\n`;
      });
    }

    md += `## BibTeX Citation\n\`\`\`bibtex\n${generateBibtex(paper)}\n\`\`\`\n`;

    papersFolder?.file(`${safeTitle}.md`, md);
  }

  // 2. Collections Folder
  const collectionsFolder = zip.folder('Collections');
  for (const col of collections) {
    const colPapers = papers.filter((p) => p.collectionIds?.includes(col.id));
    const safeName = col.name.replace(/[/\\?%*:|"<>]/g, '_');

    let md = `---\n`;
    md += `collection: "${col.name}"\n`;
    md += `paper_count: ${colPapers.length}\n`;
    md += `---\n\n`;
    md += `# 📁 Collection: ${col.name}\n\n`;
    if (col.description) md += `${col.description}\n\n`;

    md += `## Articles in this Collection\n`;
    for (const p of colPapers) {
      const safeTitle = p.title.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 80);
      md += `- [[Papers/${safeTitle}|${p.title}]] — *${Array.isArray(p.authors) ? p.authors[0] : p.authors} (${p.year || 'n.d.'})*\n`;
    }

    collectionsFolder?.file(`${safeName}.md`, md);
  }

  // 3. Raw BibTeX database file included in zip root
  zip.file('marginalia_library.bib', exportMasterBibtex(papers));

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Triggers a browser file download for text or blob.
 */
export function downloadFile(content: string | Blob, filename: string, mimeType = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
