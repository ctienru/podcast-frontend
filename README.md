# podcast-frontend

Podcast episode search frontend built with Next.js 16 and React 19, featuring server-side rendering, i18n support, and a responsive UI.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Browser     │────▶│podcast-frontend │────▶│ podcast-backend │
│  (User Client)  │     │   (Next.js)     │     │  (Search API)   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌───────▼───────┐
              │  Server   │           │    Client     │
              │Components │           │  Components   │
              │(Data Fetch)│          │ (Interaction) │
              └───────────┘           └───────────────┘
```

## Features

- **Server-First Rendering**: Server Components for data fetching, Client Components for interactivity
- **Internationalization**: English, Traditional Chinese, and Simplified Chinese with locale-based routing
- **Episode Search**: Search podcast episodes with default Smart search + Any language behavior
- **Advanced Search UI**: Progressive disclosure panel with collapsible interface
  - Match behavior options: Smart (recommended), Keyword, Exact phrase
  - Language filter: Any language, Chinese only, English only
  - Draft state management: changes apply only when user confirms
- **Click Analytics**: Episode click events tracked via `sendBeacon` to `/api/logs/click`
- **Partial Success Handling**: When backend returns `partial_success` (embedding unavailable; BM25-only results), the condition is logged server-side for diagnostics but no warning banner is shown in the UI
- **Autocomplete**: Real-time search suggestions with keyboard navigation (↑↓ Enter Escape)
- **Rankings**: Apple Podcasts rankings by region (China, Taiwan, US)
- **SEO Optimized**: Dynamic metadata, canonical URLs, Schema.org structured data
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.1 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Components | Radix UI (label, radio-group, select) |
| i18n | next-intl 4.7.0 |
| Testing | Vitest, React Testing Library |

## Project Structure

```
podcast-frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # i18n routes (en, zh-TW, zh-CN)
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── search/          # Search results
│   │   │   └── rankings/        # Podcast rankings
│   │   └── page.tsx             # Root redirect
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (button, tabs, select, etc.)
│   │   ├── search/              # Search components
│   │   │   ├── SearchPageClient.tsx    # Search page state management
│   │   │   ├── advanced/               # Advanced Search UI
│   │   │   │   ├── AdvancedSearchPanel.tsx      # Main collapsible panel
│   │   │   │   ├── MatchBehaviorSection.tsx     # Radio group for search mode
│   │   │   │   ├── LanguageFilterSection.tsx    # Dropdown for language
│   │   │   │   ├── ActionButtons.tsx            # Apply / Reset buttons
│   │   │   │   └── FiltersAppliedBar.tsx        # Active filters display
│   │   │   └── header/
│   │   │       ├── SearchBar.tsx       # Main search input
│   │   │       └── SuggestionDropdown.tsx  # Autocomplete dropdown
│   │   ├── NavSearchBox.tsx     # Header search input
│   │   └── LanguageSwitcher.tsx # i18n locale switcher
│   ├── hooks/
│   │   └── useSuggestions.ts    # Debounced autocomplete hook
│   ├── lib/                     # API client & utilities
│   ├── types/                   # TypeScript definitions
│   ├── i18n/                    # i18n configuration
│   ├── messages/                # Translation files (en.json, zh-TW.json, zh-CN.json)
│   └── __tests__/               # Unit tests
├── public/                      # Static assets
├── Dockerfile                   # Production build
└── package.json
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SEARCH_API_BASE=http://localhost:8080/api
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

### 4. Verify Setup

1. Navigate to http://localhost:3000/en
2. Enter a search query (e.g., "technology")
3. Confirm search results appear

> **Note**: Requires `podcast-backend` running on port 8080.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SEARCH_API_BASE` | Backend API URL | `http://localhost:8080/api` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL (for SEO) | `http://localhost:3000` |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |

## Routes

| Route | Description |
|-------|-------------|
| `/[locale]` | Home page with search |
| `/[locale]/search?q=<query>&page=<n>&lang=<en\|zh\|hybrid>&mode=<bm25\|knn\|hybrid\|exact>` | Search results |
| `/[locale]/rankings?region=<cn\|tw\|us>&type=<podcast\|episode>` | Podcast/episode rankings |

**Search Parameters:**

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `q` | string | - | Search query (required) |
| `page` | number | `1` | Page number |
| `lang` | `en`, `zh`, `hybrid` | `hybrid` | Language filter (Any language) |
| `mode` | `bm25`, `hybrid`, `exact` | `hybrid` | Search mode (Smart search) |

**Notes:**
- Default parameters (`mode=hybrid`, `lang=hybrid`) are omitted from URL for cleaner URLs
- All parameters are backward compatible with existing bookmarks
- Use Advanced Search UI to adjust filters interactively

Supported locales: `en`, `zh-TW`, `zh-CN`

**Rankings defaults by locale:**
- `zh-CN` → `region=cn`
- `zh-TW` → `region=tw`
- `en` → `region=us`

## Advanced Search UI

The search interface follows a **Progressive Disclosure** pattern:

### Design Principles

1. **Default = Smart & Permissive**: Users get the best results without configuration
   - Smart search mode (hybrid semantic + keyword)
   - Any language (中文 + English)
   - No UI clutter on initial search

2. **Advanced = Refinement**: Used only when users want to narrow results
   - Collapsible panel (hidden by default)
   - Draft state: changes apply only when clicking "Apply"
   - Clear "Filters applied" indicator when non-default filters are active

3. **Human-Readable UI**: No technical jargon exposed to users
   - "Smart" instead of "hybrid"
   - "Keyword" instead of "bm25"
   - "Exact phrase" instead of "exact match"

### Implementation Details

- **5 test files**, **65 tests**, **100% pass rate**
- Radix UI components for accessibility (label, radio-group, select)
- URL parameters automatically synced (default values omitted)
- Full backward compatibility with existing URLs

For design documentation, see: `podcast-daily/2026-02-02-advanced-search-ui-redesign.md`

## Testing

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Watch mode
npm run test

# Run Advanced Search tests only
npm test -- src/components/search
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t podcast-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SEARCH_API_BASE=http://backend:8080/api \
  podcast-frontend
```

## Related Projects

- **podcast-backend**: Search API service (Spring Boot)
- **podcast-search**: RSS parsing, data cleaning, ES indexing (Python)
- **podcast-crawler**: RSS fetching, show metadata extraction (Python)
- **podcast-spec**: OpenAPI specification
- **podcast-infra**: Infrastructure and deployment
