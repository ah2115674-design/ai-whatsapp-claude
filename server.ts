import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Debug ────────────────────────────────────────────────────────────────

  app.get('/api/debug/status', async (_req, res) => {
    res.json({
      supabaseUrl: !!process.env.VITE_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      twilioSid: !!process.env.TWILIO_SID,
      twilioToken: !!process.env.TWILIO_TOKEN,
      twilioNumber: process.env.TWILIO_NUMBER || 'Not Set',
      openaiKey: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });

  app.get('/api/debug/mapping/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const { data, error } = await supabase
        .from('whatsapp_numbers')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Products ─────────────────────────────────────────────────────────────

  app.get('/api/products/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Leads ────────────────────────────────────────────────────────────────

  app.get('/api/leads/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('last_interaction', { ascending: false });
      if (leadsError) throw leadsError;

      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId);
      if (convError) throw convError;

      const leadsWithConversations = leads.map((lead) => ({
        ...lead,
        conversations: conversations.filter((c) => c.lead_id === lead.id),
      }));

      res.json(leadsWithConversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Send Message ──────────────────────────────────────────────────────────

  app.post('/api/send-message', async (req, res) => {
    const { userId, leadId, message } = req.body;
    try {
      const [settingsRes, leadRes] = await Promise.all([
        supabase.from('settings').select('*').eq('user_id', userId).single(),
        supabase.from('leads').select('*').eq('id', leadId).single(),
      ]);
      if (settingsRes.error) throw settingsRes.error;
      if (leadRes.error) throw leadRes.error;

      const settings = settingsRes.data;
      const lead = leadRes.data;

      const twilioSid =
        settings.twilio_mode === 'custom' ? settings.twilio_sid : process.env.TWILIO_SID;
      const twilioToken =
        settings.twilio_mode === 'custom' ? settings.twilio_token : process.env.TWILIO_TOKEN;
      let fromNumber =
        settings.twilio_mode === 'custom' ? settings.twilio_number : process.env.TWILIO_NUMBER;

      // Ensure whatsapp: prefix
      if (fromNumber && !fromNumber.startsWith('whatsapp:')) {
        fromNumber = `whatsapp:${fromNumber}`;
      }

      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', `whatsapp:${lead.phone_number}`);
      params.append('From', fromNumber || '');
      params.append('Body', message);

      await axios.post(twilioUrl, params, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([{ lead_id: leadId, user_id: userId, message, sender: 'agent' }])
        .select()
        .single();
      if (convError) throw convError;

      await supabase
        .from('leads')
        .update({ last_interaction: new Date().toISOString() })
        .eq('id', leadId);

      res.json({ success: true, conversation });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── AI Suggest (used by Leads page "Suggest AI Reply" button) ─────────────

  app.post('/api/ai-suggest', async (req, res) => {
  const { message, context, userId } = req.body;
  try {
    // Fetch products for this user
    let productCatalog = 'No products listed yet.';
    if (userId) {
      const { data: products } = await supabase
        .from('products')
        .select('name, description, price, moq, details')
        .eq('user_id', userId);

      if (products && products.length > 0) {
        productCatalog = products.map(p =>
          `- ${p.name}: ${p.description || 'No description'}. Price: $${p.price}, MOQ: ${p.moq} units.`
        ).join('\n');
      }
    }

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional wholesale sales assistant.
Product catalog:
${productCatalog}

${context}`,
        },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      });
      const reply = aiResponse.choices[0].message.content || '';
      res.json({ reply });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Twilio Webhook ────────────────────────────────────────────────────────

  app.post('/webhook/twilio', async (req, res) => {
    const { From, To, Body } = req.body;
    console.log(`[Webhook] Received message from ${From} to ${To}: ${Body}`);

    const fromNumber = From ? From.replace('whatsapp:', '') : '';
    const toNumber = To || '';
    let userId: string | null = null;

    try {
      const cleanToNumber = toNumber.replace('whatsapp:', '');

      const { data: mapping, error: mapError } = await supabase
        .from('whatsapp_numbers')
        .select('user_id')
        .or(`whatsapp_number.eq.${toNumber},whatsapp_number.eq.${cleanToNumber}`)
        .limit(1)
        .maybeSingle();

      if (mapError || !mapping) {
        console.error(`[Webhook] No user mapping found for: ${toNumber}`);
        await supabase.from('webhook_logs').insert([{
          event_type: 'WEBHOOK_RECEIVED_NO_USER',
          payload: { From, To, Body },
          error: `No mapping found for ${toNumber} or ${cleanToNumber}`,
        }]);
        return res.status(200).send('OK');
      }

      userId = mapping.user_id;
      console.log(`[Webhook] Identified user: ${userId}`);

      await supabase.from('webhook_logs').insert([{
        user_id: userId,
        event_type: 'MESSAGE_RECEIVED',
        payload: { From, To, Body },
      }]);

      // Find or create lead
      let { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .eq('phone_number', fromNumber)
        .single();

      if (!lead) {
        console.log(`[Webhook] Creating new lead for: ${fromNumber}`);
        const { data: newLead, error: createError } = await supabase
          .from('leads')
          .insert([{
            user_id: userId,
            phone_number: fromNumber,
            name: 'New WhatsApp Lead',
            status: 'new',
            last_interaction: new Date().toISOString(),
          }])
          .select()
          .single();
        if (createError) throw createError;
        lead = newLead;
      }

      // Save customer message
      await supabase.from('conversations').insert([{
        lead_id: lead.id,
        user_id: userId,
        message: Body,
        sender: 'customer',
      }]);

      // 4. Fetch user's products to give AI context
const { data: products } = await supabase
  .from('products')
  .select('name, description, price, moq, details')
  .eq('user_id', userId);

const productCatalog = products && products.length > 0
  ? products.map(p =>
      `- ${p.name}: ${p.description || 'No description'}. Price: $${p.price}, MOQ: ${p.moq} units.${p.details ? ' Details: ' + JSON.stringify(p.details) : ''}`
    ).join('\n')
  : 'No products listed yet.';

// 5. Generate AI reply with product knowledge
let reply = 'Thank you for your message. We will get back to you shortly.';
try {
  const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional sales assistant for a wholesale manufacturer. 
You help customers with product inquiries, pricing, and minimum order quantities.
Always be helpful, professional, and concise.

Here is the current product catalog:
${productCatalog}

Only answer questions based on the products listed above. 
If asked about a product not in the catalog, politely say it is not available.
If asked about pricing or MOQ, give the exact figures from the catalog.`
      },
      {
        role: 'user',
        content: Body
      }
    ],
    temperature: 0.7,
  });
        reply = aiResponse.choices[0].message.content || reply;
        console.log(`[Webhook] AI reply: ${reply}`);
      } catch (aiErr: any) {
        console.error('[Webhook AI Error]', aiErr.message);
        await supabase.from('webhook_logs').insert([{
          user_id: userId,
          event_type: 'AI_GENERATION_FAILED',
          payload: { Body },
          error: aiErr.message,
        }]);
      }

      // Get Twilio credentials
      const { data: settingsRes } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!settingsRes) throw new Error('User settings not found');

      const twilioSid =
        settingsRes.twilio_mode === 'custom' ? settingsRes.twilio_sid : process.env.TWILIO_SID;
      const twilioToken =
        settingsRes.twilio_mode === 'custom' ? settingsRes.twilio_token : process.env.TWILIO_TOKEN;
      let fromTwilio =
        settingsRes.twilio_mode === 'custom' ? settingsRes.twilio_number : process.env.TWILIO_NUMBER;

      if (fromTwilio && !fromTwilio.startsWith('whatsapp:')) {
        fromTwilio = `whatsapp:${fromTwilio}`;
      }

      if (!twilioSid || !twilioToken || !fromTwilio) {
        throw new Error(`Missing Twilio credentials for user ${userId}`);
      }

      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', `whatsapp:${fromNumber}`);
      params.append('From', fromTwilio);
      params.append('Body', reply);

      try {
        const twilioResponse = await axios.post(twilioUrl, params, {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        console.log(`[Webhook] Twilio status: ${twilioResponse.status}`);
        await supabase.from('webhook_logs').insert([{
          user_id: userId,
          event_type: 'REPLY_SENT_SUCCESS',
          payload: { To: fromNumber, From: fromTwilio, Body: reply },
        }]);
      } catch (twilioErr: any) {
        const twilioErrorMsg = twilioErr.response?.data?.message || twilioErr.message;
        console.error('[Webhook Twilio Error]', twilioErrorMsg);
        await supabase.from('webhook_logs').insert([{
          user_id: userId,
          event_type: 'REPLY_SEND_FAILED',
          payload: { To: fromNumber, From: fromTwilio, Body: reply },
          error: twilioErrorMsg,
        }]);
        throw twilioErr;
      }

      // Save AI reply
      await supabase.from('conversations').insert([{
        lead_id: lead.id,
        user_id: userId,
        message: reply,
        sender: 'ai',
      }]);

      // Update lead last interaction
      await supabase
        .from('leads')
        .update({ last_interaction: new Date().toISOString() })
        .eq('id', lead.id);

      res.status(200).send('OK');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('[Webhook Final Error]', errorMsg);
      if (userId) {
        await supabase.from('webhook_logs').insert([{
          user_id: userId,
          event_type: 'WEBHOOK_CRITICAL_ERROR',
          payload: { From, To, Body },
          error: errorMsg,
        }]);
      } else {
        await supabase.from('webhook_logs').insert([{
          event_type: 'WEBHOOK_CRITICAL_ERROR_NO_USER',
          payload: { From, To, Body },
          error: errorMsg,
        }]);
      }
      res.status(200).send('OK');
    }
  });

  // ── Frontend ──────────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  // FIXED — only catches non-API routes
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get(/^(?!\/api|\/webhook).*$/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
