# Roast My GitHub 🔥

The internet's most savage code critic. Enter any GitHub username and get an AI-generated roast of their profile, repos, and coding habits.

## What it does

- Fetches real GitHub profile data (repos, stars, followers, languages, account age)
- Generates a personalised roast using Google Gemini AI
- Three intensity levels: **Mild**, **Medium**, and **Savage**
- Stores roast history and shows community stats

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, React Query
- **Backend:** Express 5, Node.js 24
- **AI:** Google Gemini 2.5 Flash
- **Database:** PostgreSQL + Drizzle ORM
- **Monorepo:** pnpm workspaces, TypeScript 5.9

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL database

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file or set these as secrets:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |

### Run in development

```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend
pnpm --filter @workspace/roast-my-github run dev
```

### Database setup

```bash
pnpm --filter @workspace/db run push
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/roast` | Generate a roast for a GitHub user |
| `GET` | `/api/roast/history` | Get the 20 most recent roasts |
| `GET` | `/api/roast/stats` | Get community roast statistics |

### POST /api/roast

```json
{
  "username": "torvalds",
  "intensity": "savage"
}
```

## Project Structure

```
artifacts/
  roast-my-github/   # React + Vite frontend
  api-server/        # Express API server
lib/
  db/                # Drizzle ORM schema and client
  api-spec/          # OpenAPI spec + codegen
  api-client-react/  # Generated React Query hooks
```

## License

MIT
