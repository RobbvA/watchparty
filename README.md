# WatchParty

WatchParty is a spoiler-safe social companion app for people watching a show together.

Users watch on external platforms (Netflix, Crunchyroll, etc). WatchParty provides the social layer.

---

## What it does

- Create a watch party around a show
- Invite others to join the party
- Browse episodes together
- Post reactions tied to your watch progress
- Spoiler filtering hides reactions from ahead of where you are

---

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma 7](https://www.prisma.io/) — ORM
- [PostgreSQL](https://www.postgresql.org/) — Database
- [Tailwind CSS](https://tailwindcss.com/) — Styling

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RobbvA/watchparty.git
cd watchparty
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/watchparty?schema=public"
```

### 4. Set up the database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
app/
├── api/
│   ├── parties/          # Party creation API
│   └── episodes/
│       └── [episodeSessionId]/
│           ├── posts/     # Reactions API
│           └── progress/  # User progress API
├── create-party/          # Create party page
└── parties/
    └── [partyId]/
        ├── page.tsx       # Party detail page
        └── episodes/
            └── [episodeNumber]/
                └── page.tsx  # Episode discussion page
lib/
└── prisma.ts              # Prisma client
prisma/
├── schema.prisma          # Database models
└── seed.ts                # Seed data
```

---

## Current Milestones

| Milestone | Status     | Description                                     |
| --------- | ---------- | ----------------------------------------------- |
| 1         | ✅ Done    | Party creation, database, party page            |
| 2         | ✅ Done    | Episodes, episode list, current episode control |
| 3         | ✅ Done    | Reactions, progress tracking, spoiler filtering |
| 4         | 🔜 Planned | TBD                                             |

---

## Data Models

- **Party** — a watch group around a show
- **EpisodeSession** — an episode within a party
- **Post** — a reaction posted at a specific timestamp
- **UserProgress** — tracks how far a user has watched

---

## License

MIT
