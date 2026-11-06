# User Guide: Marginalia Academic Companion

## How to Run the Application

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional for AI features)
echo "GEMINI_API_KEY=your_key_here" > .env

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Production Deployment
```bash
# Build the application
npm run build

# Deploy the 'deploy' folder contents to your server

# Or run locally:
cd deploy
npm install
node server.cjs
```

## Environment Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| GEMINI_API_KEY | No (AI features work in fallback) | (none) | Google Gemini API key for AI assistant |
| PORT | No | 3000 | Server port |
| APP_URL | No | localhost:3000 | Application URL for OAuth callbacks |

### Getting a Gemini API Key

1. Visit https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API key" or "Create API key"
4. Copy the key to your `.env` file:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```

### API Key Requirement for AI Section

The AI Research Assistant requires a valid Gemini API key. When:
- **No API key provided**: AI assistant button shows a prompt to get a key
- **Invalid API key**: Falls back to local text synthesis
- **Valid API key**: Full AI-powered analysis

## How to Import Papers

### Via DOI
1. Click "Import" or "Ingest" button (upload icon)
2. Enter a valid DOI (e.g., `10.1038/s41586-020-2649-2`)
3. Metadata is fetched from Crossref API
4. Click "Add to Library" to save

### Manual Entry
1. Click "New Article" button
2. Fill in title, authors, year, journal
3. Save to library

## How to Use the Bookshelf

1. **Navigate**: Use arrow keys or mouse to browse books
2. **Open Paper**: Click on a book to view details
3. **Read Paper**: Click "Read" to open dedicated reader
4. **Customize**: Right-click books for customization options

### Bookshelf Features
- **View Modes**: Shelf (default), Catalog (grid/list)
- **Categories**: All RESEARCH, FOOD SYSTEMS, BIG DATA, etc.
- **Sorting**: Custom, Year, Title, Author, Status, Recent
- **Shelf Materials**: Walnut, Oak, Maple, etc.

## How to Read and Annotate PDFs

**Note**: PDF functionality is planned but not fully implemented. The designated reader is a visual simulation with:
- Page navigation controls
- Zoom functionality
- Placeholder for annotation tools
- Reading progress tracking

## How to Organize Collections

1. **Create Collection**: Click collection button, then "+"
2. **Add Papers**: Drag papers into collections or bulk add
3. **Customize Appearance**: Change colors, cover styles
4. **Tags**: Add tags to papers for cross-cutting organization

### Collection Management
- Edit collection names
- Reorder papers within collections
- Export collection metadata
- Bulk operations: move, delete, change status

## How to Configure AI Features

### AI Research Assistant Access

1. Click the AI assistant icon (sparkles) in the toolbar
2. **If no API key**: Prompt appears with link to Google AI Studio
3. **If configured**: Full AI chat interface opens

### AI Capabilities
- **Ask**: General questions about your library
- **Summarize**: Get structured summaries of papers
- **Compare**: Compare methodologies across papers
- **Synthesis**: Literature review generation

### Citation Generation
The AI assistant generates citations in format:
`[Source 1] *Title* (Year) by First Author. Category: Category.`

Always verify AI-generated citations against the original sources.

## Reading Tracker

- **Track Progress**: Reading time, pages, completion status
- **Set Goals**: Daily/weekly reading targets
- **View Stats**: Activity dashboard with trends
- **Session History**: Past reading sessions with timestamps

## Notes & Knowledge Management

1. **Create Note**: Click note icon on any paper
2. **Edit**: Rich text editing with markdown support
3. **Link**: Notes can link to papers and collections
4. **Search**: Find notes by keywords

## Technical Notes

### Data Persistence
All data is stored in browser localStorage. Clearing browser data will remove all your library, notes, and settings.

### Browser Support
- Chrome 100+
- Firefox 95+
- Safari 15+
- Edge 100+

### Offline Mode
The app works offline - all data is cached in localStorage.
