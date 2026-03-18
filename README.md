# Zync AI CRM — Backend Setup Guide

## Project Structure

```
zync-backend/
├── server.js              ← Entry point
├── package.json
├── .env.example           ← Copy to .env and fill in
├── schema.sql             ← Run this in Supabase first
├── lib/
│   └── supabase.js        ← Supabase client
├── middleware/
│   └── auth.js            ← JWT verification
└── routes/
    ├── auth.js            ← Signup, login, profile
    ├── products.js        ← Product CRUD
    ├── leads.js           ← Leads CRUD + dashboard + export
    ├── settings.js        ← WhatsApp number + Twilio config
    └── whatsapp.js        ← Twilio webhook + AI test endpoint
```

---

## Step 1 — Set Up Supabase

1. Go to https://supabase.com → New Project
2. Once created, open **SQL Editor → New Query**
3. Paste the entire contents of `schema.sql` and click **Run**
4. Go to **Project Settings → API**
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role** key (NOT anon key) → `SUPABASE_SERVICE_KEY`

---

## Step 2 — Get API Keys

### OpenAI
1. https://platform.openai.com/api-keys → Create new key
2. Copy → `OPENAI_API_KEY`

### Twilio
1. https://console.twilio.com → Sign up / Log in
2. Copy **Account SID** → `TWILIO_ACCOUNT_SID`
3. Copy **Auth Token** → `TWILIO_AUTH_TOKEN`
4. Activate the WhatsApp Sandbox (Messaging → Try it out → Send a WhatsApp message)
5. Your sandbox number is something like `+1 415 523 8886`

---

## Step 3 — Local Development

```bash
# Clone / download this folder
cd zync-backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env with your real keys

# Start dev server
npm run dev
```

Server starts on http://localhost:3000

Test it:
```bash
curl http://localhost:3000/health
# → { "status": "ok" }
```

---

## Step 4 — Deploy to Render

1. Push this folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add Environment Variables (from your `.env` file):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `OPENAI_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `FRONTEND_URL` (your Google AI Studio frontend URL)
6. Click **Create Web Service**

Your backend URL will be: `https://your-app-name.onrender.com`

---

## Step 5 — Configure Twilio Webhook

1. Go to Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings
2. Set **When a message comes in** to:
   ```
   https://your-app-name.onrender.com/api/webhook
   ```
3. Method: **POST**
4. Save

Now every WhatsApp message to your Twilio number hits your backend → OpenAI → reply.

---

## Step 6 — Connect Your Frontend

In the frontend HTML file, find `API_BASE` and update:

```js
const API_BASE = 'https://your-app-name.onrender.com';
```

Then replace the mock `setTimeout` calls in the frontend with real `fetch` calls. Example:

```js
// Login
const res = await fetch(`${API_BASE}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await res.json();
localStorage.setItem('token', token);

// Authenticated request
const res = await fetch(`${API_BASE}/api/products`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
const { products } = await res.json();
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/signup` | No | Create account |
| POST | `/api/login` | No | Login, returns JWT |
| PUT | `/api/user` | JWT | Update profile |
| PUT | `/api/user/password` | JWT | Change password |
| DELETE | `/api/user` | JWT | Delete account |
| GET | `/api/products` | JWT | List your products |
| POST | `/api/products` | JWT | Add product |
| PUT | `/api/products/:id` | JWT | Edit product |
| DELETE | `/api/products/:id` | JWT | Delete product |
| GET | `/api/leads` | JWT | List leads (filter: `?status=qualified`) |
| GET | `/api/leads/dashboard` | JWT | Dashboard metrics |
| GET | `/api/leads/export` | JWT | Download CSV |
| PUT | `/api/leads/:id` | JWT | Update lead status |
| DELETE | `/api/leads/:id` | JWT | Delete one lead |
| DELETE | `/api/leads` | JWT | Delete all leads |
| GET | `/api/settings` | JWT | Get WhatsApp settings |
| POST | `/save-whatsapp` | JWT | Save WhatsApp config |
| POST | `/api/whatsapp/test` | JWT | Test AI response |
| POST | `/api/webhook` | None | Twilio incoming messages |
| GET | `/health` | None | Health check |
