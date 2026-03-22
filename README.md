# WatchParty

WatchParty is a spoiler-safe social companion app for people watching a show together.

Users watch on external platforms (Netflix, Crunchyroll, etc). WatchParty provides the social layer.

---

## What it does

- Browse live, upcoming and ended watch parties on the home page
- Create a watch party around a show with a schedule and watch link
- Browse episodes together
- Post reactions tied to your watch progress
- Spoiler filtering hides reactions from ahead of where you are
- Party chat for general conversation during a watch event
- Live status indicator and countdown timer
- PiP-friendly layout for watching alongside the app

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
│   ├── parties/                    # Party creation and messages API
│   │   └── [partyId]/
│   │       └── messages/           # Party chat API
│   └── episodes/
│       └── [episodeSessionId]/
│           ├── posts/              # Reactions API
│           └── progress/           # User progress API
├── components/
│   └── PartyCard.tsx               # Reusable party card
├── create-party/                   # Create party page
└── parties/
    └── [partyId]/
        ├── page.tsx                # Party detail page
        ├── PartyChat.tsx           # Chat component
        ├── EpisodeDropdown.tsx     # Episode selector
        └── episodes/
            └── [episodeNumber]/
                ├── page.tsx        # Episode discussion page
                └── EpisodeClient.tsx
lib/
├── prisma.ts                       # Prisma client
└── partyStatus.ts                  # Status calculation utility
prisma/
├── schema.prisma                   # Database models
└── seed.ts                         # Seed data
```

---

## Milestones

| Milestone | Status     | Description                                               |
| --------- | ---------- | --------------------------------------------------------- |
| 1         | ✅ Done    | Party creation, database, party page                      |
| 2         | ✅ Done    | Episodes, episode list, current episode control           |
| 3         | ✅ Done    | Reactions, progress tracking, spoiler filtering           |
| 4         | ✅ Done    | Username persistence, progress auto-load, UX improvements |
| 5         | ✅ Done    | Scheduling, live status, watch link                       |
| 6         | ✅ Done    | Party chat, messages API                                  |
| 7         | ✅ Done    | Chat polling, live label, PiP-friendly layout             |
| 8         | ✅ Done    | Home page redesign, party discovery, PartyCard            |
| 9         | 🔜 Planned | TBD                                                       |

---

## Data Models

- **Party** — a watch group around a show
- **EpisodeSession** — an episode within a party
- **Post** — a reaction posted at a specific timestamp
- **UserProgress** — tracks how far a user has watched
- **PartyMessage** — a chat message in a party

---

## License

MIT
