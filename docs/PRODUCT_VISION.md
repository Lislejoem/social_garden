# Social Garden: Product Vision & Feature Ideas

A living document of ideas for evolving Social Garden from its current state to something special.

---

## Part 1: Completing Version 1

These are gaps and features needed to call this a "complete" v1 product.

### 1.1 Critical Missing Pieces

### 1.2 New V1 Features

**~~Contact Briefing (AI-Powered)~~** ✅ COMPLETED
- ~~Combines relationship summary + conversation prep into one feature~~
- ~~On each contact profile, show an AI-generated briefing:~~
  - ~~"Here's what you know about Sarah at a glance"~~
  - ~~"Things to ask about" based on history~~
  - ~~"Last time you talked, she mentioned her mom was having surgery"~~
  - ~~"Her son Max starts college this fall"~~
- ~~Pulls from: seedlings, recent interactions, family member events, preferences~~
- ~~Refreshes on-demand when user requests it on the profile~~
- **Implemented:** ContactBriefing component with AI-generated relationship summary, recent highlights, conversation starters, and upcoming milestones. Uses `/api/contacts/[id]/briefing` endpoint with `generateBriefing()` in anthropic.ts.

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

**~~Avatar Upload~~** ✅ COMPLETED
- ~~Currently: Stores avatarUrl but no way to set it~~
- ~~Options: File upload, or URL input, or pull from social profiles~~
- **Implemented:** EditAvatarModal with manual URL input and Gravatar auto-fetch. Extensible design ready for LinkedIn/Instagram OAuth integration in V2. Uses `avatarSource` and `preferredAvatarSource` fields for future multi-source support.

**~~"View All History" Link~~** ✅ COMPLETED
- ~~Currently: Shows in InteractionTimeline but doesn't navigate anywhere~~
- ~~Needed: Full interaction history page, or expandable timeline~~
- **Implemented:** Expandable timeline with "View All History" toggle button, shows count of interactions

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

**~~Manual Interaction Parsing~~** ✅ COMPLETED
- ~~Currently: The manual interaction logging (clicking Call, Text, or Meet on someone's profile page) doesn't update any other information other than an interaction in the Recent Growth section~~
- ~~Needed: Parse the entry so it can update the rest of the profile (maybe parse it like the text from a voice note so we don't need to build that infra again?)~~
- **Implemented:** When a summary is provided in manual interaction logging, it's sent through the same AI pipeline as voice notes. The VoicePreviewModal shows extracted preferences, family members, and seedlings for user review before saving. If no summary is provided, the interaction is saved directly (existing behavior).

**~~Birthday UI, Year~~** ✅ COMPLETED
- ~~Currently: Great! But requires a year.~~
- ~~Needed: Allow for a birthday entry without a year (in case I don't know it)~~
- **Implemented:** Month/day dropdowns with optional "I know the year" checkbox. Supports partial birthdays with zodiac and countdown.

**~~Birthday UI, Date~~** ✅ COMPLETED
- ~~Currently: There's a bug with the date where the day entered sets the birthday to the previous day. (e.g. an edit to Sep 28, 2014 shows the birthday as Sep 27, 2014)~~
- **Fixed:** Timezone handling corrected using local date parsing instead of UTC

**~~Dashboard Searching~~** ✅ COMPLETED
- ~~Currently: The search doesn't search within the Recent Growth summaries~~
- ~~Needed: Allow the search feature to search within Recent Growth summaries~~
- **Implemented:** Search now includes interaction summaries (limited to 20 most recent per contact for performance)

**~~Interactions via Voice~~** ✅ COMPLETED
- ~~Currently: Interactions recorded via Voice are marked as `VOICE`~~
- ~~Needed: Interactions recorded via Voice should be marked as Meet, Text, Call, etc. based on the content of the note~~
- **Implemented:** AI now infers interaction type (CALL, MESSAGE, MEET, VOICE) from voice note content. VoicePreviewModal shows type selector with platform dropdown for MESSAGE type. Centralized config in `interactions.ts` makes adding new platforms/types trivial.

**~~Interaction Types~~** ✅ COMPLETED
- ~~Currently: Interactions are logged as either text, voice, meet, or call~~
- ~~Needed: We need to add interactions for Instagram, Telegram, and LinkedIn.~~
- **Implemented:** MESSAGE type with platform selector (Text, Instagram, Telegram, LinkedIn). Displays platform name in timeline.

**Contact Briefing Hot Fixes**
- Currently: 
   1. Regenerates a new contact briefing each time you open a profile
   2. Conversation prep takes up a ton of space right at the top and people may not even want it
- Needed: 
   1. Don't do it every time, and don't do it unless Conversation Prep is opened.
   2. Put Conversation Prep as a button at the top of a profile, and have it appear as a modal when clicked on.
- Consideration: 
   1. Not sure what the best option is. Maybe only regenerate it when one hasn't been generated in a while? Or only when new information is added?
   2. It doesn't have to be this exactly. Ask before implementing anything.

**Interaction Hot Fixes**
- When the user mentions a date in the interaction logging, the date is not saved as the date of the interaction. We need to ensure the date updates based on the content of the message, especially relative dates like "yesterday", "last week", etc.
- When editing the date of interactions, the date is assigned as the day previous to the date set. (This was a previous issue with another part of the app with logging dates as UTC. We should scrape the codebase to ensure dates are handled appropriately, fix them, then add to documentation how we approach dates and times.)

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

#### Completed ✅
1. ~~Manual interaction logging~~ ✅
2. ~~Birthday display~~ ✅
3. ~~Edit social links~~ ✅
4. ~~Dashboard filtering/sorting~~ ✅
5. ~~Interaction editing~~ ✅
6. ~~Birthday date bug fix~~ ✅
7. ~~Birthday without year~~ ✅
8. ~~Interaction types (IG/Telegram/LinkedIn)~~ ✅
9. ~~Dashboard search in summaries~~ ✅
10. ~~View All History link~~ ✅
11. ~~Contact Briefing (AI-powered)~~ ✅ - relationship summary, highlights, conversation starters
12. ~~Avatar Upload~~ ✅ - manual URL input, Gravatar auto-fetch, extensible for OAuth

#### Remaining V1 Items
13. **Smart Reminders** - digest, birthdays, seedling follow-ups
14. **Quick Capture Widget** - one-tap voice recording
15. **Photo & Screenshot Capture** - with AI extraction
16. Offline support with queue
17. Error feedback improvements
18. Topics of Interest semantic classification
19. ~~Voice → inferred interaction type~~ ✅
20. ~~Manual interaction parsing~~ ✅

### Recommended Next Steps
Based on current progress, here are recommended next features to implement:

1. **Contact Briefing Hot Fixes** - Avoid regenerating on every profile load, show as modal
2. **Error Feedback** - Improves UX across the app
3. **Smart Reminders** - High value but requires scoping discussion first
4. **Topics of Interest Classification** - Let AI tag topics vs preferences semantically
5. **Offline Support** - Queue voice notes for processing when back online

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
- Voice notes and manual interactions (with summaries) are processed by Claude AI via `/api/ingest` with a dry-run preview flow
- **Manual Interaction Parsing**: When a summary is entered in QuickLogInteraction, it builds a natural language prompt via `buildRawInput()` and sends it to `/api/ingest`. The `onPreview` callback shows the VoicePreviewModal for user review. Without a summary, interactions save directly to `/api/interactions`.
- Contact briefings are generated via `/api/contacts/[id]/briefing` using `generateBriefing()` in anthropic.ts
- The codebase uses Next.js 14 App Router with strict TypeScript
- **Testing**: Vitest with React Testing Library. Run `npm test` or `npm run test:run`. Mocking Anthropic SDK requires `vi.hoisted()`.
- Key files: `anthropic.ts` (AI - extraction + briefing), `avatar.ts` (Gravatar + multi-source), `health.ts` (status calculation), `interactions.ts` (interaction types & platforms config), `prisma/schema.prisma` (data model)
- **Interaction Types**: Centralized in `interactions.ts`. To add a new platform (e.g., WhatsApp): add to PLATFORMS array, add keywords to PLATFORM_KEYWORDS, add label to PLATFORM_LABELS. AI prompt, UI, and types auto-update.
- **Avatar System**: Uses `avatarSource` and `preferredAvatarSource` fields. Currently supports manual URL and Gravatar. Designed for LinkedIn/Instagram OAuth integration in V2.
- Joe is excited about AI-powered insights, deep relationship data, AND simplicity - find the balance
- No feature is off the table - he said "no restrictions" and wants to explore everything
- **Smart Reminders**: When implementing, ask scoping questions about notification frequency, channels, and timing
- **Message Import**: Extensive privacy discussion needed before implementation
- **Meeting Transcription**: Security discussion needed before implementation
- Platform priority is 75% mobile, 25% desktop
- Offline support with queue is confirmed for V1
