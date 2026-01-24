# Social Garden: Future Features (V2+)

Ideas for evolving Social Garden beyond V1.

---

## Deferred V1 Features

Features designed for V1 but requiring infrastructure not yet in place.

### Smart Reminders / Daily Notifications

**Requires**: Email service (Resend, SendGrid) OR mobile app with push notifications

**Core idea**: Proactively notify users about contacts needing attention:
- Daily/weekly digest: "3 contacts need watering"
- Birthday reminders: "Sarah's birthday is in 3 days"
- Follow-up reminders based on seedlings: "You said you'd check in about Mike's job search"

**Design approach** (documented for future implementation):
- Compute reminders on-demand from Contact data (not pre-generated)
- Store only dismissal/snooze records in database
- Auto-resolve when user logs interaction (health improves, reminder disappears)
- Snooze options: 1 day, 1 week
- Severity levels: urgent (parched, birthday ≤7 days), warning (thirsty, birthday 8-30 days)

**Why deferred**: Requires a way to reach users when they're not in the app. Current web app has no email service or push notification infrastructure.

---

## V2 Features - Differentiation

Deep integrations, organization, and advanced capture.

### Social Monitoring & Contextual Prompts

**Social Feed Monitoring**
- Connect LinkedIn, Facebook (and potentially Instagram, Twitter)
- Get notified when a contact posts something significant:
  - "David just posted about a promotion"
  - "Sarah shared an article about her industry"
  - "Mike announced he's moving to a new city"
- Prompt: "Might be a good time to reach out"
- Privacy note: Needs careful consideration of data handling and user consent

### Life Events Timeline

**Major Life Event Tracking**
- Track significant events: new job, moved cities, had a baby, got married, promotion
- Can be extracted from voice notes or added manually
- Visual emphasis in timeline: bigger fonts, icons, distinct styling
- "Sarah: Moved to Austin (March 2025), Started at Stripe (June 2025)"
- These become permanent context for the relationship

### Organization & Views

**Contact Groups (Gardens)**
- "Work Friends", "College Crew", "Mentors", "Family"
- Contacts can belong to multiple groups
- Filter dashboard by group
- Set different cadences per group

**Map View**
- See contacts distributed by location
- "When I'm in Austin, who should I reach out to?"
- Great for travel planning

### Capture Enhancements

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
- Privacy note: Extensive discussion needed before implementation - concerns about data access, storage, and potential misuse

### Discovery Sharing

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

**Why this matters:** Relationships thrive on shared experiences and thoughtful recommendations.

---

## V3 Features - Innovation

Network intelligence and mutual tools.

### Mutual Relationship Tools

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

### Advanced AI Features

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

### Network-Level Intelligence

**Introducer Suggestions**
- "Sarah is looking for a job in tech; you know David at Google"
- Help your contacts by connecting them
- Track introductions you've made

**Network Health Dashboard**
- Aggregate stats: "You have 45 contacts, 12 thriving, 20 growing, 8 thirsty, 5 parched"
- Trends over time: "Your network health improved 15% this month"
- Balance indicators: "80% of your interactions are with 20% of your contacts"

### Gift Ideas & History

- Track what you've given and when
- AI suggests gift ideas based on preferences
- "You got her a Kindle last year; she mentioned loving mystery novels recently"

---

## V2/V3 Prioritization

### V2 - Differentiation
1. Social feed monitoring (LinkedIn/Facebook notifications)
2. Life events timeline (with visual emphasis)
3. Contact groups (Gardens)
4. Map view
5. Calendar integration
6. Voice journal mode
7. Meeting transcription
8. Message import (email, iMessage, Instagram, Telegram)
9. Discovery Sharing - track experiences, match to contacts, suggest sharing

### V3 - Innovation
1. Shared gardens (couples/partners)
2. Relationship requests
3. Pattern detection
4. Health forecasting
5. Network health dashboard
6. Introducer suggestions
7. Gift tracking & suggestions
8. AI "Before You Meet" briefing

---

## Product Decisions & Assumptions

### Answered Questions

1. **Notification Philosophy**: **HIGHLY PROACTIVE** - Push notifications, daily digests, birthday reminders. The app should actively help the user remember to nurture relationships.

2. **Privacy Stance**: **ALL-IN, BUT SECURITY IS KEY** - Calendar sync, location awareness, email/message access are all acceptable to maximize intelligence. However, security must be a first-class concern - encrypted storage, secure API handling, clear data policies.

3. **Platform Priority**: **75% Mobile, 25% Desktop** - Mobile is primary (voice recording, quick capture, on-the-go access), but desktop is more than nice-to-have. Users need a good experience on both, with mobile being the priority.

4. **Data Ownership**: **YES** - Users should be able to export all their data easily and import from other sources.

5. **Relationship Types**: **UNIFIED UX** - Same interface for personal and professional relationships. No separate modes.

6. **Family as Special Category**: **NO** - Family members treated the same as any other contact. No special health rules.

7. **Monetization**: **NOT NOW** - This is a personal project for now. Monetization can be figured out later if needed.

### Assumptions

- The botanical/gardening metaphor is core to the brand and should be extended, not replaced
- Voice-first interaction is a key differentiator and should remain central
- AI processing costs are acceptable (Claude API calls per voice note)
- Mobile is the primary interaction point (voice recording UX implies this)
- Privacy-conscious: data stays on device/your server, not shared with social networks
- Single-user focused initially (not team/enterprise)
