# WatchParty — Development Log

This document tracks the development progress of WatchParty milestone by milestone.

---

## Milestone 1 — Foundation

**Goal:** Set up the project and basic party creation flow.

### What was built

- Next.js 16 project with TypeScript and Tailwind CSS
- PostgreSQL database connection via Prisma 7
- `Party` data model
- Home page with link to Create Party
- Create Party page with form
- Party detail page showing stored party data
- API route: `POST /api/parties`

### Key decisions

- Used Prisma 7 which requires a driver adapter (`@prisma/adapter-pg`) instead of a connection URL in the schema
- Used `cuid` for all IDs

### Result

A user can create a party and be redirected to a party detail page showing the stored data.

---

## Milestone 2 — Episodes

**Goal:** Add episode structure inside a party.

### What was built

- `EpisodeSession` data model linked to `Party`
- Episode list on the party detail page
- Current episode highlighted visually
- Episode links to discussion route
- Host control dropdown to change current episode
- API route: `PATCH /api/parties/[partyId]`
- Seed data: each party gets 3 episodes automatically

### Key decisions

- Kept episode discussion page as a separate route for scalability
- Used `router.refresh()` after updating current episode to avoid full page reload

### Result

A user can browse episodes inside a party, see which episode is current, change the current episode, and open an episode discussion page.

---

## Milestone 3 — Reactions and Spoiler Filtering

**Goal:** Add the core episode interaction system.

### What was built

- `Post` data model — reactions tied to a timestamp in seconds
- `UserProgress` data model — tracks how far a user has watched per episode
- API route: `POST /api/episodes/[episodeSessionId]/progress`
- API route: `GET /api/episodes/[episodeSessionId]/posts`
- API route: `POST /api/episodes/[episodeSessionId]/posts`
- `EpisodeClient` component with:
  - Username input
  - Progress slider (0 to 60 minutes)
  - Save progress button
  - Reaction form tied to saved progress
  - Reaction feed ordered by timestamp
  - Spoiler filtering: reactions beyond user progress are hidden
- Seed data: Episode 1 of "Anime Night" has 3 posts at different timestamps

### Key decisions

- Split episode page into a server component (data fetching) and a client component (interactivity)
- Spoiler filtering is done client-side based on saved progress
- No authentication — username is entered manually for this MVP

### Result

A user can set their watch progress, post reactions tied to their timestamp, and read reactions from others with spoilers automatically hidden.

---

## Milestone 4 — Episode UX Improvements

**Goal:** Improve the episode discussion experience without adding major new systems.

### What was built

- Username persisted in localStorage and auto-loaded on page visit
- User progress auto-loaded from database on page load
- Improved spoiler card UI with styled grey box and clear messaging
- Loading and success states for Save Progress and Post buttons
- Improved episode page layout with card-based sections and gray background
- Empty state for reaction feed

### Key decisions

- Used lazy `useState` initializer instead of `useEffect` to read from localStorage to avoid React cascading render warning
- Progress auto-load uses a `useEffect` that fetches from the API on mount
- Status feedback kept inline rather than using toast notifications for simplicity

### Result

The episode discussion page now feels polished. Username and progress are remembered between visits. User actions give clear visual feedback.

---

## Milestone 5 — Live Watch Party Scheduling

**Goal:** Introduce scheduling foundation for live watch events.

### What was built

- Extended `Party` model with `watchLink`, `scheduledAt`, `liveWindowMinutes`, and `status` fields
- Status calculation utility in `lib/partyStatus.ts`
- Party page now shows:
  - 🔴 LIVE NOW indicator with pulsing dot
  - Countdown timer (Starts in Xh Xm) for upcoming parties
  - Watch Party Ended state for past parties
  - Watch Now button linking to external streaming platform
- Create Party form updated with watch link and scheduled time fields
- Seed data updated with one upcoming and one live party

### Key decisions

- Status is calculated at render time from `scheduledAt` and `liveWindowMinutes` rather than stored as a fixed value
- Status utility kept in `lib/` so it can be reused across pages
- Live window defaults to 120 minutes

### Result

A user can schedule a watch party with a time and watch link. The party page shows the correct live status and a direct link to the streaming platform.

---

## Milestone 6 — Party Chat

**Goal:** Introduce a basic persistent party chat system.

### What was built

- `PartyMessage` model with `partyId`, `username`, `body`, `createdAt`
- API route: `GET /api/parties/[partyId]/messages` — returns latest 100 messages
- API route: `POST /api/parties/[partyId]/messages` — creates a new message
- `PartyChat` component with:
  - Message list ordered by time
  - Username pre-filled from localStorage
  - Send with button or Enter key
  - Auto-scroll to latest message
  - Loading and error states
  - Empty state: "No messages yet. Say hello!"
- Party page updated with chat section at the bottom

### Key decisions

- Chat is separate from episode reactions — it is general party conversation not tied to timestamps
- Username shared with episode reactions via localStorage
- No realtime updates — messages load on mount and update on send
- Limited to latest 100 messages per party

### Result

Users can send and read chat messages on the party page. Messages persist in the database and survive page refreshes.

---

## Up Next — Milestone 7

TBD
