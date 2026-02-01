# Grove

A Personal CRM that helps you cultivate meaningful connections. Think of your relationships as plants in a garden - some need frequent watering (contact), others thrive with less attention.

## Features

- **Contact Dashboard** - View all your connections in a beautiful grid with health indicators
- **Health Status** - Automatic tracking of relationship health (Thriving, Growing, Thirsty, Parched)
- **Voice Notes** - Record quick notes about conversations using your browser's speech recognition
- **AI-Powered Processing** - Claude automatically extracts preferences, family members, and follow-up items
- **Seedling Bed** - Track future conversation starters and follow-up ideas
- **Always/Never Preferences** - Remember what people like and dislike

## Prerequisites

### 1. Install Node.js

You need Node.js version 18.17 or higher. Download it from:
https://nodejs.org/

To check if you have it installed:
```bash
node --version
```

### 2. Get an Anthropic API Key

The app uses Claude AI to process your voice notes. You'll need an API key:

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy the key (you'll need it for setup)

**Cost:** Claude API typically costs $3-15 per million tokens. Voice note processing uses a small amount per note.

## Installation

1. **Navigate to the app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   DATABASE_URL="file:./prisma/dev.db"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open in your browser:**
   http://localhost:3000

## Usage

### Adding Contacts

**Option 1: Voice Note (Recommended)**
1. Click the microphone button in the bottom-right corner
2. Speak naturally about someone: "I just talked to Mark Henderson. He lives in Montana and loves dark roast coffee. His dog Bo is doing well. I should ask him about his Mustang restoration next time."
3. Click "Send to Garden"
4. Claude will automatically extract and save the information

**Option 2: Manual Entry**
1. Click "Plant New Contact"
2. Fill in the details
3. Click "Plant Contact"

### Understanding Health Status

- **Thriving** (green flower) - Recently connected, relationship is flourishing
- **Growing** (green sprout) - Good connection, on track
- **Thirsty** (yellow leaf) - Might want to reach out soon
- **Parched** (orange droplets) - Overdue for connection

Health is calculated based on your chosen connection frequency:
- **Often**: Connect every 7-10 days
- **Regularly**: Connect every 3-4 weeks
- **Seldomly**: Connect every 3 months
- **Rarely**: Connect every 6-12 months

### Recording Conversations

After talking to someone, tap the microphone and summarize what you discussed. Claude will:
- Log the interaction
- Extract new preferences ("ALWAYS likes coffee", "NEVER mention peanuts")
- Add family members ("His son Leo is 6 years old")
- Create seedlings for follow-up ("Ask about the job interview")

## Testing on Mobile

To test on your phone (same WiFi network):

1. **Find your computer's IP address:**

   **Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.1.100)

   **Mac:**
   Go to System Preferences > Network > WiFi, or run:
   ```bash
   ipconfig getifaddr en0
   ```

2. **Start the server with network access:**
   ```bash
   npm run dev -- --hostname 0.0.0.0
   ```

3. **On your phone:**
   Open Safari or Chrome and go to: `http://YOUR_IP:3000`

   Example: `http://192.168.1.100:3000`

**Note:** Voice recording requires HTTPS in production, but works over HTTP on localhost. For mobile testing on your local network, voice recording should work in Chrome but may not work in Safari.

## Database Management

### View your data:
```bash
npx prisma studio
```
This opens a visual database browser at http://localhost:5555

### Reset the database:
```bash
npx prisma db push --force-reset
```
**Warning:** This deletes all data!

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **SQLite** - Local database
- **Anthropic Claude** - AI processing
- **Web Speech API** - Browser-native voice recognition

## Troubleshooting

### Voice recording not working?
- Make sure you're using Chrome or Edge (best support)
- Allow microphone permissions when prompted
- Voice recording won't work over HTTP on mobile (only localhost)

### API errors?
- Check that your `ANTHROPIC_API_KEY` is set correctly in `.env.local`
- Verify your API key is valid at https://console.anthropic.com

### Database errors?
- Run `npx prisma generate` to regenerate the client
- Run `npx prisma db push` to sync the schema

## Project Structure

```
app/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── contact/
│   │   │   ├── new/           # New contact form
│   │   │   └── [id]/          # Contact profile
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database (created on first run)
└── .env.local                 # Environment variables (you create this)
```

## License

This project uses the Polyform Noncommercial License. See LICENSE.md in the parent directory for details.
