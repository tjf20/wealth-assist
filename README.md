# Wealth Assistant

A dark-themed AI-powered Financial Advisor workstation built with React, Node.js/Express, and the Claude API.

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Styling  | Tailwind CSS + custom CSS variables |
| Charts   | Chart.js + react-chartjs-2 |
| Backend  | Node.js + Express (ESM) |
| AI       | Anthropic Claude claude-sonnet-4-20250514 (streaming) |
| Icons    | Tabler Icons webfont |

## Project Structure

```
wealth-assist/
├── .env.example
├── package.json          # Root — runs both client + server
├── server/
│   ├── index.js          # Express server entry point
│   ├── routes/
│   │   ├── ai.js         # Claude API — chat, brief, priorities
│   │   ├── clients.js    # Client CRUD + summary
│   │   ├── markets.js    # Market data
│   │   ├── practice.js   # Practice scorecard + hurdles
│   │   └── reports.js    # Report library
│   └── data/             # JSON seed data (9 clients, markets, practice)
└── client/
    └── src/
        ├── views/        # HomeView, TodayView, ClientsView, ClientDetailView, ReportsView
        ├── components/   # AppShell, Avatar, InsightCard, StatCard, Charts
        └── hooks/        # useAI (streaming), useData (fetch wrappers)
```

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd wealth-assist
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=development
```

Get your API key at: https://console.anthropic.com

### 3. Run the app

```bash
npm run dev
```

This starts both the Express server (port 3001) and Vite dev server (port 5173) concurrently.

Open **http://localhost:5173**

## Views

| Route           | View                | Description |
|----------------|---------------------|-------------|
| `/`             | Home carousel       | Clients / Practice / Markets tabs with charts |
| `/today`        | Today view          | AI morning brief, ranked priorities, meeting prep, chat |
| `/clients`      | Client list         | Searchable table with alert filtering |
| `/clients/:id`  | Client detail       | Full profile, holdings, accounts, AI chat scoped to client |
| `/reports`      | Reports library     | Saved reports + AI report generator |

## AI Features

### Streaming chat
Every view with a chat panel streams responses in real-time from Claude claude-sonnet-4-20250514. Client detail views automatically pass portfolio context so Claude can answer specific questions without the FA re-explaining the situation.

### AI priorities
`/today` calls `POST /api/ai/priorities` which sends all client alerts and practice hurdle data to Claude and receives a dynamically ranked priority list. Falls back to static priorities if the API is unavailable.

### AI report generator
The Reports view includes a full AI report generation panel with suggested prompts and streaming output.

## Demo Data

The app ships with 9 realistic test clients for James Whitfield's book:

| Client | AUM | Alert | Key Issue |
|--------|-----|-------|-----------|
| Margaret Russo | $4.2M | Critical | Tech overweight + RMD |
| Sandra & Tom Larkin | $3.1M | Critical | 13mo overdue review + first RMD |
| Carol & Neil Foster | $5.6M | None | Meeting today — estate review |
| David Kim | $1.8M | Review | Lagging benchmark, fee-based opportunity |
| Patricia Walsh | $920K | Review | Annual review due |
| James O'Brien | $2.4M | None | Strong relationship, referral source |
| Robert Patel | $1.1M | Info | Managed account eligible |
| Linda Hoffmann | $780K | None | Conservative, income focus |
| Thomas & Ann Murphy | $2.9M | Review | Beneficiary update needed |

## Extending the App

### Add a real data source
Replace the JSON reads in `server/routes/clients.js` with database queries or API calls. The response shape is stable — the frontend hooks won't need changes.

### Add Salesforce integration
Swap the activity tab in `ClientDetailView` with a Salesforce API call. The `useData.js` hook pattern makes this straightforward.

### Add authentication
Wrap the Express routes with JWT middleware and add a login view. The `AppShell` component is the right place to add an auth check.

### Add FactSet / market data
Replace `server/data/markets.json` with live FactSet API calls in `server/routes/markets.js`.
