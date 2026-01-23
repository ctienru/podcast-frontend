# podcast-frontend

Modern podcast search frontend built with Next.js 16 and React 19, featuring server-side rendering, i18n support, and a responsive UI.

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
- **Internationalization**: English and Chinese (Traditional) with locale-based routing
- **Search**: Dual search for podcasts and episodes with pagination
- **Rankings**: Apple Podcasts rankings by country (Taiwan, US)
- **SEO Optimized**: Dynamic metadata, canonical URLs, Schema.org structured data

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.1 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| i18n | next-intl 4.7.0 |
| Testing | Vitest, React Testing Library |

## Project Structure

```
podcast-frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # i18n routes (en, zh)
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── search/          # Search results
│   │   │   └── rankings/        # Podcast rankings
│   │   └── page.tsx             # Root redirect
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   └── search/              # Search components
│   ├── lib/                     # API client & utilities
│   ├── types/                   # TypeScript definitions
│   ├── i18n/                    # i18n configuration
│   ├── messages/                # Translation files (en.json, zh.json)
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
| `/[locale]/search?q=<query>&page=<n>` | Search results |
| `/[locale]/rankings` | Podcast rankings |

Supported locales: `en`, `zh`

## Testing

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Watch mode
npm run test
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
- **podcast-search**: Elasticsearch indexing service
- **podcast-crawler**: Data crawling service
- **podcast-spec**: OpenAPI specification
