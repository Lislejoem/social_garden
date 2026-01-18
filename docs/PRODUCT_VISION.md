# Social Garden: Product Vision & Feature Ideas

A living document of ideas for evolving Social Garden from its current state to something special.

---

## Part 1: Completing Version 1

These are gaps in the current implementation that should be addressed before calling this a "complete" v1 product.

### 1.1 Critical Missing Pieces

**Manual Interaction Logging**
- Currently: Can only log interactions via voice notes
- Needed: Quick-log button for "I just called Sarah" or "Texted with Mike"
- Why: Not every interaction warrants a voice note; sometimes you just want to tap and go
- Location: Contact profile page, maybe also dashboard quick-action

**Birthday UI**
- Currently: Field exists in database, stored via AI extraction, but never displayed
- Needed: Show birthday on profile, age calculation, birthday highlight on dashboard
- Question: Should birthdays drive notifications? Or just be visible?

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

### 1.2 Polish Items for V1

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

---

## Part 2: Recommended Features (Think Big!)

These are features that would make Social Garden genuinely compelling and differentiated.

### 2.1 AI-Powered Insights

**Relationship Summaries**
- "Here's what you know about Sarah at a glance"
- Auto-generated from all interactions, preferences, family members
- Refreshes periodically or on-demand
- Surfaces things like "You've talked about her job stress in your last 3 conversations"

**Conversation Prep**
- Before a call/meeting, generate "Things to ask about" based on history
- "Last time you talked, she mentioned her mom was having surgery - you might want to ask how that went"
- "Her son Max starts college this fall - that might be worth mentioning"
- Could pull from seedlings, recent interactions, and family member events

**Pattern Detection**
- "You tend to reach out to professional contacts more than personal ones"
- "You've been talking to Sarah a lot lately - is there something going on?"
- "You mentioned 'work stress' in conversations with 5 different people this month"
- Surfaces trends you might not notice yourself

**Relationship Health Forecasting**
- "If you don't reach out to David in the next week, he'll move to 'parched'"
- Calendar-style view of upcoming health transitions
- Helps prioritize who to reach out to

### 2.2 Proactive Nudges

**Smart Reminders**
- Daily/weekly digest: "3 contacts need attention"
- Birthday reminders: "Sarah's birthday is in 3 days"
- Follow-up reminders based on seedlings: "You said you'd check in about Mike's job search"

**Contextual Prompts**
- "You're near the coffee shop where you usually meet Alex" (location-aware)
- "It's been 2 weeks since you talked to your mom" (relationship-specific)
- "David just posted about a promotion - might be a good time to reach out" (social-aware, if integrated)

**"Best Time to Reach Out" Suggestions**
- Learn patterns from past interactions (you usually text Sarah on weekends)
- Suggest optimal timing for reconnection

### 2.3 Deep Relationship Data

**Life Events Timeline**
- Track major events: new job, moved cities, had a baby, got married
- These become permanent context for the relationship
- Can be extracted from voice notes or added manually
- "Sarah: Moved to Austin (March 2025), Started at Stripe (June 2025)"

**Gift Ideas & History**
- Track what you've given and when
- AI suggests gift ideas based on preferences
- "You got her a Kindle last year; she mentioned loving mystery novels recently"

**Communication Preferences**
- Some people prefer texts, others calls, others only see you in person
- Track and suggest the right channel for each person

**Relationship Milestones**
- "You've known David for 5 years today"
- "This is your 50th interaction with Sarah"
- Celebrate the relationships, not just maintain them

### 2.4 Organization & Views

**Contact Groups (Gardens)**
- "Work Friends", "College Crew", "Mentors", "Family"
- Contacts can belong to multiple groups
- Filter dashboard by group
- Set different cadences per group

**Map View**
- See contacts distributed by location
- "When I'm in Austin, who should I reach out to?"
- Great for travel planning

**Calendar View**
- See interactions over time
- Plan future interactions
- Visualize relationship health trends

**Relationship Graph**
- Visual web of connections
- "Sarah knows Mike" (they're both in your contacts and you mentioned them together)
- See clusters and bridges in your network

### 2.5 Capture Enhancements

**Quick Capture Widget**
- Home screen widget (mobile) for instant voice notes
- One tap → record → done
- Process in background

**Photo Notes**
- Take a photo → AI extracts context
- "Dinner at Sarah's house" → logs interaction, maybe extracts what you ate together
- Screenshots of text conversations → AI summarizes

**Calendar Integration**
- Sync with Google/Apple calendar
- Auto-create interactions from calendar events titled "Coffee with Sarah"
- Suggest logging after meetings end

**Email/Text Import** (advanced)
- Connect email/iMessage (with consent)
- Auto-log communication frequency
- Extract important details from messages
- Question: Privacy implications - would you want this?

---

## Part 3: Further-Out Ideas (Creative & Unexpected)

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

### 3.2 Ambient & Passive Intelligence

**Voice Journal Mode**
- End-of-day journal: "Tell me about your day"
- AI extracts all the people you mentioned and creates interactions
- "I grabbed coffee with Sarah, then had a tough meeting with my boss David..."
- Low-friction daily capture

**Meeting Transcription**
- Record meetings/calls (with consent) → auto-generate summaries
- Extract action items, preferences, topics discussed
- Never forget what was said

**Smart Watch Integration**
- Tap to start recording after a conversation
- Quick "log interaction" from wrist
- Vibrate reminder: "You're meeting Sarah in 10 minutes - here's what to ask about"

### 3.3 Relationship Growth Features

**Conversation Starters**
- "I don't know what to talk about with David anymore"
- AI generates suggestions based on shared interests, recent events, their preferences
- "Ask about the hiking trip he was planning"
- "He loves talking about woodworking - ask what he's building"

**Relationship Goals**
- Set goals: "I want to deepen my friendship with Sarah"
- AI suggests actions: "Try meeting in person instead of just texting"
- Track progress over time

**Conflict Notes**
- Track unresolved tensions or difficult topics
- "Sarah and I had a disagreement about X - I should be sensitive about that"
- Private, but helps you navigate relationships thoughtfully

**Gratitude Prompts**
- "What do you appreciate about David?"
- Build a private gratitude log for each relationship
- Reminds you why people matter when you're feeling disconnected

### 3.4 Network-Level Intelligence

**Introducer Suggestions**
- "Sarah is looking for a job in tech; you know David at Google"
- Help your contacts by connecting them
- Track introductions you've made

**Network Health Dashboard**
- Aggregate stats: "You have 45 contacts, 12 thriving, 20 growing, 8 thirsty, 5 parched"
- Trends over time: "Your network health improved 15% this month"
- Balance indicators: "80% of your interactions are with 20% of your contacts"

**Circle of Influence Visualization**
- Concentric circles: close friends → friends → acquaintances → distant
- See how relationships drift over time
- Set intentions: "I want to move David closer to my inner circle"

### 3.5 Unusual Integrations

**Spotify/Music Context**
- "Sarah loves 90s hip-hop" - suggest a playlist to share
- "What music was playing when you last met?"
- Soundtrack to your relationships

**Book/Media Recommendations**
- "Sarah mentioned she's into sci-fi" → suggest books to recommend
- Track what you've recommended and their reactions

**Restaurant/Experience Tracking**
- "Great restaurants I've been to with Sarah"
- "Sarah loves Ethiopian food" → suggest places near you
- Build shared experience memories

**AI "Before You Meet" Briefing**
- 24 hours before a calendar event with a contact:
- Get a briefing: recent interactions, their current situation, suggested topics, gifts if it's their birthday soon
- Like a relationship executive assistant

---

## Part 4: Questions & Assumptions

### Answered Questions

1. **Notification Philosophy**: **HIGHLY PROACTIVE** - Push notifications, daily digests, birthday reminders. The app should actively help the user remember to nurture relationships.

2. **Privacy Stance**: **ALL-IN, BUT SECURITY IS KEY** - Calendar sync, location awareness, email/message access are all acceptable to maximize intelligence. However, security must be a first-class concern - encrypted storage, secure API handling, clear data policies.

3. **Platform Priority**: **75% Mobile, 25% Desktop** - Mobile is primary (voice recording, quick capture, on-the-go access), but desktop is more than nice-to-have. Users need a good experience on both, with mobile being the priority.

### Still Open Questions

1. **Offline Support**: Should the app work fully offline? Voice notes would queue for processing when back online.

2. **Data Ownership**: Should users be able to export all their data easily? Import from other CRMs?

3. **Relationship Types**: Should we explicitly support "professional" vs "personal" relationships with different UX? Or keep it unified?

4. **Family as Special Category**: Should family members in contacts be treated differently than friends? (e.g., parents always stay in "thriving" category)

5. **Monetization**: Any thoughts on free vs paid features? This affects what to build first.

### Assumptions Made

- The botanical/gardening metaphor is core to the brand and should be extended, not replaced
- Voice-first interaction is a key differentiator and should remain central
- AI processing costs are acceptable (Claude API calls per voice note)
- Mobile is the primary interaction point (voice recording UX implies this)
- Privacy-conscious: data stays on device/your server, not shared with social networks
- Single-user focused initially (not team/enterprise)

---

## Part 5: Suggested Prioritization

### Immediate (V1 Completion)
1. Manual interaction logging
2. Birthday display & basic reminders
3. Edit social links
4. Dashboard filtering/sorting
5. Interaction editing

### Near-Term (V1.5 - Delight)
1. Relationship summaries (AI-generated)
2. Conversation prep
3. Life events timeline
4. Contact groups
5. Better mobile experience

### Medium-Term (V2 - Differentiation)
1. Smart reminders & nudges
2. Calendar integration
3. Photo/screenshot capture
4. Map view
5. Gift tracking

### Long-Term (V3 - Innovation)
1. Voice journal mode
2. Shared gardens
3. Network health dashboard
4. Meeting transcription
5. Relationship goals

---

## Notes for Future Claude

- The health system uses a gardening metaphor: thriving → growing → thirsty → parched
- Voice notes are processed by Claude AI via `/api/ingest` with a dry-run preview flow
- The codebase uses Next.js 14 App Router with strict TypeScript
- Key files: `anthropic.ts` (AI), `health.ts` (status calculation), `prisma/schema.prisma` (data model)
- The user is excited about AI-powered insights, deep relationship data, AND simplicity - find the balance
- No feature is off the table - they said "no restrictions" and want to explore everything
