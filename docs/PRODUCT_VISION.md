# Social Garden: Product Vision & Feature Ideas

A living document of ideas for evolving Social Garden from its current state to something special.

---

## Part 1: Completing Version 1

These are gaps and features needed to call this a "complete" v1 product.

### 1.1 Critical Missing Pieces

**Manual Interaction Logging**
- Currently: Can only log interactions via voice notes
- Needed: Quick-log button for "I just called Sarah" or "Texted with Mike"
- Why: Not every interaction warrants a voice note; sometimes you just want to tap and go
- Location: Contact profile page, maybe also dashboard quick-action

**Birthday UI**
- Currently: Field exists in database, stored via AI extraction, but never displayed
- Needed: Show birthday on profile, age calculation, birthday highlight on dashboard

**Edit Social Links**
- Currently: Can add socials during contact creation, but can't edit after
- Needed: Inline editing for Instagram, LinkedIn, phone, email, address
- Location: Contact profile page, similar to EditableText pattern

**Dashboard Sorting & Filtering**
- Currently: Search only, returns all contacts
- Needed: Filter by health status (show me all parched contacts), sort by last contact date, sort by name
- Why: As contact list grows, users need better organization

**Interaction Editing**
- Currently: Interactions are read-only after creation
- Needed: Edit summary, change date, delete interaction
- Why: Mistakes happen; AI extractions aren't always perfect

### 1.2 New V1 Features

**Contact Briefing (AI-Powered)**
- Combines relationship summary + conversation prep into one feature
- On each contact profile, show an AI-generated briefing:
  - "Here's what you know about Sarah at a glance"
  - "Things to ask about" based on history
  - "Last time you talked, she mentioned her mom was having surgery"
  - "Her son Max starts college this fall"
- Pulls from: seedlings, recent interactions, family member events, preferences
- Refreshes on-demand when user requests it on the profile
- Why: Makes every interaction more meaningful

**Smart Reminders**
- Daily/weekly digest: "3 contacts need attention"
- Birthday reminders: "Sarah's birthday is in 3 days"
- Follow-up reminders based on seedlings: "You said you'd check in about Mike's job search"
- Implementation note: Scope carefully when building - ask questions about notification frequency, channels, timing preferences

**Quick Capture Widget**
- Home screen widget (mobile) for instant voice notes
- One tap → record → done
- Process in background
- Why: Reduce friction for the most common action

**Photo & Screenshot Capture**
- Take a photo → AI extracts context
- "Dinner at Sarah's house" → logs interaction, extracts what you ate together
- Screenshots of text conversations → AI summarizes the exchange
- Allow additional context via voice or typing alongside the photo/screenshot
- Why: Sometimes a picture captures the moment better than words

### 1.3 Polish Items for V1

**Avatar Upload**
- Currently: Stores avatarUrl but no way to set it
- Options: File upload, or URL input, or pull from social profiles
- Question: Is this important for v1, or can we ship with initials-only?

**"View All History" Link**
- Currently: Shows in InteractionTimeline but doesn't navigate anywhere
- Needed: Full interaction history page, or expandable timeline

**Topics of Interest Section**
- Currently: Filters preferences by character length (>15 chars) as a heuristic
- Needed: Semantic classification - let AI tag things as "topics" vs "preferences"
- Or: Remove this section until it's properly implemented?

**Error Feedback**
- Currently: Generic error handling, limited user-facing messages
- Needed: Clear error states, retry options, "what went wrong" explanations

**Offline Support**
- Voice notes queue for processing when back online
- Local-first data storage with sync
- Why: App should work anywhere, anytime

---

## Part 2: Version 2 Features

Features that will make Social Garden genuinely compelling and differentiated.

### 2.1 Social Monitoring & Contextual Prompts

**Social Feed Monitoring**
- Connect LinkedIn, Facebook (and potentially Instagram, Twitter)
- Get notified when a contact posts something significant:
  - "David just posted about a promotion"
  - "Sarah shared an article about her industry"
  - "Mike announced he's moving to a new city"
- Prompt: "Might be a good time to reach out"
- Privacy note: Needs careful consideration of data handling and user consent

### 2.2 Life Events Timeline

**Major Life Event Tracking**
- Track significant events: new job, moved cities, had a baby, got married, promotion
- Can be extracted from voice notes or added manually
- Visual emphasis in timeline: bigger fonts, icons, distinct styling
- "Sarah: Moved to Austin (March 2025), Started at Stripe (June 2025)"
- These become permanent context for the relationship

### 2.3 Organization & Views

**Contact Groups (Gardens)**
- "Work Friends", "College Crew", "Mentors", "Family"
- Contacts can belong to multiple groups
- Filter dashboard by group
- Set different cadences per group

**Map View**
- See contacts distributed by location
- "When I'm in Austin, who should I reach out to?"
- Great for travel planning

### 2.4 Capture Enhancements

**Calendar Integration**
- Sync with Google/Apple calendar
- Auto-create interactions from calendar events titled "Coffee with Sarah"
- Suggest logging after meetings end

**Voice Journal Mode**
- End-of-day journal: "Tell me about your day"
- AI extracts all the people you mentioned and creates interactions
- "I grabbed coffee with Sarah, then had a tough meeting with my boss David..."
- Low-friction daily capture

**Meeting Transcription**
- Record meetings/calls (with consent) → auto-generate summaries
- Extract action items, preferences, topics discussed
- Never forget what was said
- Security note: Needs careful thought about storage, encryption, consent

**Message Import** (Advanced)
- Connect email, iMessage, Instagram DMs, Telegram (with consent)
- Auto-log communication frequency
- Extract important details from messages
- Privacy note: This needs extensive discussion before implementation - concerns about data access, storage, and potential misuse

### 2.5 Discovery Sharing (Unified Integration Feature)

**Track What You Experience, Share What Matters**

The core idea: You discover things every day - music, books, restaurants, places, shows, articles. Some of your contacts would love to hear about them. This feature connects your discoveries to your relationships.

**How it works:**
1. **Capture your discoveries** (manual or via integrations):
   - Music: Spotify/Apple Music integration or manual logging
   - Books/Media: Goodreads, Letterboxd, or manual logging
   - Places: Location check-ins, restaurant visits, travel
   - Articles/Content: Save links, share what you're reading

2. **AI matches discoveries to contacts based on their preferences:**
   - "You just listened to a 90s hip-hop playlist - Sarah loves that genre"
   - "You finished a sci-fi novel - Mike mentioned he's into sci-fi"
   - "You found a great Ethiopian restaurant - Sarah loves Ethiopian food"
   - "You're visiting Austin - you have 3 contacts there"

3. **Proactive suggestions:**
   - "Share this playlist with Sarah?"
   - "Recommend this book to Mike?"
   - "Text David that you're in his city?"

4. **Track what you've shared:**
   - "You recommended Dune to Mike last month - ask if he started it"
   - "You shared that restaurant with Sarah - did she try it?"

**Why this matters:** Relationships thrive on shared experiences and thoughtful recommendations. This turns your everyday discoveries into relationship-building opportunities.

---

## Part 3: Further-Out Ideas (V3+)

These are ideas that push the boundaries - possible, interesting, but not obvious.

### 3.1 Mutual Relationship Tools

**Shared Gardens**
- Two Social Garden users can opt-in to share a contact
- Both see combined context about the person
- "You and your spouse both know David - here's what you both know"
- Great for couples managing social obligations together

**Relationship Requests**
- Send someone a "relationship request"
- They fill out their own preferences, birthday, communication style
- You get accurate data; they get to control their info
- "I'm trying to be a better friend - help me remember what matters to you"

### 3.2 Advanced AI Features

**Pattern Detection**
- "You tend to reach out to professional contacts more than personal ones"
- "You've been talking to Sarah a lot lately - is there something going on?"
- "You mentioned 'work stress' in conversations with 5 different people this month"
- Surfaces trends you might not notice yourself

**Relationship Health Forecasting**
- "If you don't reach out to David in the next week, he'll move to 'parched'"
- Calendar-style view of upcoming health transitions
- Helps prioritize who to reach out to

**AI "Before You Meet" Briefing**
- 24 hours before a calendar event with a contact:
- Get a briefing: recent interactions, their current situation, suggested topics, gifts if it's their birthday soon
- Like a relationship executive assistant

### 3.3 Network-Level Intelligence

**Introducer Suggestions**
- "Sarah is looking for a job in tech; you know David at Google"
- Help your contacts by connecting them
- Track introductions you've made

**Network Health Dashboard**
- Aggregate stats: "You have 45 contacts, 12 thriving, 20 growing, 8 thirsty, 5 parched"
- Trends over time: "Your network health improved 15% this month"
- Balance indicators: "80% of your interactions are with 20% of your contacts"

### 3.4 Gift Ideas & History

- Track what you've given and when
- AI suggests gift ideas based on preferences
- "You got her a Kindle last year; she mentioned loving mystery novels recently"

---

## Part 4: Questions & Assumptions

### Answered Questions

1. **Notification Philosophy**: **HIGHLY PROACTIVE** - Push notifications, daily digests, birthday reminders. The app should actively help the user remember to nurture relationships.

2. **Privacy Stance**: **ALL-IN, BUT SECURITY IS KEY** - Calendar sync, location awareness, email/message access are all acceptable to maximize intelligence. However, security must be a first-class concern - encrypted storage, secure API handling, clear data policies.

3. **Platform Priority**: **75% Mobile, 25% Desktop** - Mobile is primary (voice recording, quick capture, on-the-go access), but desktop is more than nice-to-have. Users need a good experience on both, with mobile being the priority.

4. **Offline Support**: **YES** - Voice notes should queue for processing when back online. Local-first approach.

5. **Data Ownership**: **YES** - Users should be able to export all their data easily and import from other sources.

6. **Relationship Types**: **UNIFIED UX** - Same interface for personal and professional relationships. No separate modes.

7. **Family as Special Category**: **NO** - Family members treated the same as any other contact. No special health rules.

8. **Monetization**: **NOT NOW** - This is a personal project for now. Monetization can be figured out later if needed.

### Assumptions Made

- The botanical/gardening metaphor is core to the brand and should be extended, not replaced
- Voice-first interaction is a key differentiator and should remain central
- AI processing costs are acceptable (Claude API calls per voice note)
- Mobile is the primary interaction point (voice recording UX implies this)
- Privacy-conscious: data stays on device/your server, not shared with social networks
- Single-user focused initially (not team/enterprise)

---

## Part 5: Suggested Prioritization

### V1 - Complete Product
Core functionality + AI briefing + smart capture

1. Manual interaction logging
2. Birthday display
3. Edit social links
4. Dashboard filtering/sorting
5. Interaction editing
6. **Contact Briefing (AI-powered)** - relationship summary + conversation prep
7. **Smart Reminders** - digest, birthdays, seedling follow-ups
8. **Quick Capture Widget** - one-tap voice recording
9. **Photo & Screenshot Capture** - with AI extraction
10. Offline support with queue
11. Polish items (avatar, history link, error feedback)

### V2 - Differentiation
Deep integrations + organization + advanced capture

1. Social feed monitoring (LinkedIn/Facebook notifications)
2. Life events timeline (with visual emphasis)
3. Contact groups (Gardens)
4. Map view
5. Calendar integration
6. Voice journal mode
7. Meeting transcription
8. Message import (email, iMessage, Instagram, Telegram)
9. **Discovery Sharing** - track experiences, match to contacts, suggest sharing

### V3 - Innovation
Network intelligence + mutual tools

1. Shared gardens (couples/partners)
2. Relationship requests
3. Pattern detection
4. Health forecasting
5. Network health dashboard
6. Introducer suggestions
7. Gift tracking & suggestions
8. AI "Before You Meet" briefing

---

## Notes for Future Claude

- The health system uses a gardening metaphor: thriving → growing → thirsty → parched
- Voice notes are processed by Claude AI via `/api/ingest` with a dry-run preview flow
- The codebase uses Next.js 14 App Router with strict TypeScript
- Key files: `anthropic.ts` (AI), `health.ts` (status calculation), `prisma/schema.prisma` (data model)
- Joe is excited about AI-powered insights, deep relationship data, AND simplicity - find the balance
- No feature is off the table - he said "no restrictions" and wants to explore everything
- **Smart Reminders**: When implementing, ask scoping questions about notification frequency, channels, and timing
- **Message Import**: Extensive privacy discussion needed before implementation
- **Meeting Transcription**: Security discussion needed before implementation
- Platform priority is 75% mobile, 25% desktop
- Offline support with queue is confirmed for V1
