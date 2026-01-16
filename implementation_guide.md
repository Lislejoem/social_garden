The Social Garden: Final Implementation Spec

1. Core Data Models (Prisma / Turso or Postgres)

Contact: id, name, avatarUrl, location, birthday.

cadence: Enum (OFTEN, REGULARLY, SELDOMLY, RARELY).

healthStatus: Computed field (Thriving, Growing, Thirsty, Parched).

socials: JSON { instagram, linkedin, email, phone, address }.

Preference: id, contactId, category (ALWAYS/NEVER), content.

Interaction: id, contactId, date, type (CALL/TEXT/MEET/VOICE), summary.

Seedling: id, contactId, content, status (ACTIVE/PLANTED).

FamilyMember: id, contactId, name, relation.

2. The AI Gardener (The "Magic" Part)

Endpoint: POST /api/ingest
Logic:

Takes rawInput (string from voice transcript or OCR from screenshot).

Uses Claude API to extract structured JSON.

System Prompt: "You are a personal relationship assistant. Extract names, preferences (ALWAYS/NEVER), family members (kids/partners), and future follow-up 'seedlings' from this text. If the person exists, update their record; if not, create a new contact."

3. Engagement Framework (Health Logic)

The "Thirst" levels are calculated by comparing the lastInteraction.date to the cadence:

Often: Needs contact every 7–10 days. (Thirsty @ 10, Parched @ 14).

Regularly: Needs contact every 3–4 weeks. (Thirsty @ 30, Parched @ 45).

Seldomly: Needs contact every 3 months. (Thirsty @ 90, Parched @ 120).

Rarely: Needs contact every 6–12 months.

4. Deployment Strategy (Production)

Database: Use Turso (SQLite-compatible) for cloud sync.

Hosting: Deploy to Vercel for automatic SSL (required for microphone access).

PWA: Ask Claude Code to add a manifest.json and basic service worker to enable 'Add to Home Screen' functionality.