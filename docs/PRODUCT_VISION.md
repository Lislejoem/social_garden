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

---

## Remaining V1 Items

### Features

**Smart Reminders**
- Daily/weekly digest: "3 contacts need attention"
- Birthday reminders: "Sarah's birthday is in 3 days"
- Follow-up reminders based on seedlings: "You said you'd check in about Mike's job search"
- Implementation note: Scope carefully - ask about notification frequency, channels, timing preferences

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

**Offline Support**
- Voice notes queue for processing when back online
- Local-first data storage with sync

---

## Recommended Next Steps

1. **Smart Reminders** - High value but requires scoping discussion first
2. **Offline Support** - Queue voice notes for processing when back online
3. **Quick Capture Widget** - Mobile widget for instant voice notes

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
