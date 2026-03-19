# WholesaleAI CRM

Multi-user WhatsApp CRM for manufacturers with automated lead management, product catalogs, and AI-powered messaging via OpenAI.

## Stack

- **Frontend**: React 19, Tailwind CSS, Recharts, Framer Motion
- **Backend**: Express, TypeScript, tsx
- **Database + Auth**: Supabase
- **Messaging**: Twilio WhatsApp API
- **AI**: OpenAI gpt-4o-mini

## Local Development

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in all values:
   ```bash
   cp .env.example .env
   ```
4. Run the Supabase schema — paste the contents of `supabase_schema.sql` into your Supabase SQL Editor
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Render or Railway

**Build command:** `npm install && npm run build`  
**Start command:** `NODE_ENV=production tsx server.ts`

Set all environment variables from `.env.example` in your hosting dashboard.

After deploying, set your Twilio WhatsApp webhook URL to:
```
https://your-app-url.com/webhook/twilio
```

Then register each user's Twilio number in Supabase:
```sql
INSERT INTO whatsapp_numbers (user_id, whatsapp_number)
VALUES ('user-uuid', 'whatsapp:+14155238886');
```

## Verify deployment

Visit `/api/debug/status` — all values should be `true`.
