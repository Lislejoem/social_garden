# Social Garden: V1 Product Vision

A personal CRM app for nurturing relationships. Voice notes are transcribed and processed by Claude AI to extract contact information, preferences, family members, and follow-up items.

---

## V1 Goal

A complete, polished product that handles the core use case: helping users maintain meaningful relationships through voice-first capture and AI-powered insights.

---

## Completed Features

1. Manual interaction logging
2. Birthday display (with year-optional support)
3. Edit social links
4. Dashboard filtering/sorting
5. Interaction editing
6. Interaction types (IG/Telegram/LinkedIn)
7. Dashboard search in summaries
8. View All History link
9. Contact Briefing (AI-powered) - relationship summary, highlights, conversation starters
10. Avatar Upload - manual URL input, Gravatar auto-fetch
11. Interaction date handling - relative dates ("yesterday", "last week") and timezone-safe editing
12. Error Feedback - Toast system with error/success variants, user-facing error messages
13. Celebration Animation - Garden-themed confetti when logging interactions
14. Topics of Interest Classification - AI semantically classifies preferences as TOPIC (interests/passions) vs PREFERENCE (specific likes/dislikes)
15. Offline Voice Note Queue - Voice notes queue locally when offline, auto-sync when back online

---

## Remaining V1 Items

### Features

**Quick Capture Widget**
- Home screen widget (mobile) for instant voice notes
- One tap → record → done
- Process in background

**Photo & Screenshot Capture**
- Take a photo → AI extracts context
- "Dinner at Sarah's house" → logs interaction, extracts what you ate together
- Screenshots of text conversations → AI summarizes the exchange
- Allow additional context via voice or typing alongside the photo/screenshot

### Polish

**Local-First Data Storage** (optional enhancement)
- Currently: voice notes queue offline, rest requires online
- Future: Full offline-first with sync for all data

---

## Recommended Next Steps

1. **Quick Capture Widget** - Mobile widget for instant voice notes
2. **Photo/Screenshot Capture** - AI extracts context from images
3. **Smart Reminders** - Deferred until email service or mobile app is added (see FUTURE_FEATURES.md)

---

## Beyond V1

See [FUTURE_FEATURES.md](./FUTURE_FEATURES.md) for V2+ ideas including:
- Social feed monitoring
- Life events timeline
- Contact groups (Gardens)
- Map view
- Calendar integration
- Voice journal mode
- Discovery sharing
- Network intelligence features
