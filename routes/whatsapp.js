const express = require('express');
const twilio = require('twilio');
const { OpenAI } = require('openai');
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/webhook  — Twilio sends ALL incoming WhatsApp messages here
//  No auth middleware here — Twilio calls this directly
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  try {
    const incomingMsg = req.body.Body?.trim();
    const customerPhone = req.body.From;   // e.g. "whatsapp:+923001234567"
    const toNumber = req.body.To;          // e.g. "whatsapp:+14155238886"

    if (!incomingMsg || !customerPhone) {
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Strip "whatsapp:" prefix for DB storage
    const cleanCustomerPhone = customerPhone.replace('whatsapp:', '');
    const cleanToNumber = toNumber.replace('whatsapp:', '');

    // 1. Find which user owns this WhatsApp number
    const { data: settings } = await supabase
      .from('settings')
      .select('user_id, ai_name, ai_greeting, twilio_sid, twilio_auth_token')
      .eq('whatsapp_number', cleanToNumber)
      .single();

    if (!settings) {
      console.warn(`[webhook] No user found for WhatsApp number: ${cleanToNumber}`);
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // 2. Fetch that user's product catalog
    const { data: products } = await supabase
      .from('products')
      .select('name, price, moq, description, delivery')
      .eq('user_id', settings.user_id)
      .eq('status', 'active');

    // 3. Build AI reply
    const aiReply = await generateAIReply({
      customerMessage: incomingMsg,
      products: products || [],
      aiName: settings.ai_name || 'Zara',
      aiGreeting: settings.ai_greeting,
    });

    // 4. Classify the lead status
    const status = classifyLead(incomingMsg, products || []);

    // 5. Log the lead in Supabase
    await supabase.from('leads').insert({
      user_id: settings.user_id,
      customer_phone: cleanCustomerPhone,
      inquiry_text: incomingMsg,
      ai_reply: aiReply,
      status,
    });

    // 6. Send the reply via Twilio TwiML
    twiml.message(aiReply);
    res.type('text/xml');
    return res.send(twiml.toString());

  } catch (err) {
    console.error('[webhook error]', err);
    // Still return valid TwiML so Twilio doesn't retry endlessly
    res.type('text/xml');
    return res.send(twiml.toString());
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/whatsapp/test  — manual test from the dashboard (requires JWT)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/test', auth, async (req, res) => {
  try {
    const { message, customerPhone } = req.body;

    if (!message) return res.status(400).json({ error: 'message is required' });

    // Fetch user's products
    const { data: products } = await supabase
      .from('products')
      .select('name, price, moq, description, delivery')
      .eq('user_id', req.user.id)
      .eq('status', 'active');

    // Fetch user's AI persona
    const { data: settings } = await supabase
      .from('settings')
      .select('ai_name, ai_greeting')
      .eq('user_id', req.user.id)
      .single();

    const aiReply = await generateAIReply({
      customerMessage: message,
      products: products || [],
      aiName: settings?.ai_name || 'Zara',
      aiGreeting: settings?.ai_greeting || '',
    });

    const status = classifyLead(message, products || []);

    // Optionally log this as a test lead
    if (customerPhone) {
      await supabase.from('leads').insert({
        user_id: req.user.id,
        customer_phone: customerPhone,
        inquiry_text: message,
        ai_reply: aiReply,
        status,
      });
    }

    return res.json({ reply: aiReply, status });
  } catch (err) {
    console.error('[ai test]', err);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls OpenAI GPT-4o with a system prompt containing the product catalog.
 * Returns a WhatsApp-ready reply string.
 */
async function generateAIReply({ customerMessage, products, aiName, aiGreeting }) {
  const catalogText = products.length
    ? products.map(p =>
        `• ${p.name}: ${p.price} | MOQ: ${p.moq} | ${p.description} | Delivery: ${p.delivery}`
      ).join('\n')
    : 'No products currently listed.';

  const systemPrompt = `You are ${aiName}, a professional WhatsApp sales assistant.
Your job is to help customers with product inquiries and move them toward making a purchase.

PRODUCT CATALOG:
${catalogText}

RULES:
- Keep replies concise and conversational (WhatsApp style, under 200 words)
- Use simple formatting — no markdown headers or bullet lists with asterisks
- Be warm, helpful, and professional
- Always try to qualify the lead by asking about quantity, budget, or timeline
- If asked about something not in the catalog, politely say it's not available
- Sign off as ${aiName}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: customerMessage },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return completion.choices[0].message.content.trim();
}

/**
 * Simple heuristic to classify a lead as qualified / inquiry / cold.
 * You can replace this with a second AI call for higher accuracy.
 */
function classifyLead(message, products) {
  const msg = message.toLowerCase();

  const buyingSignals = [
    'price', 'cost', 'how much', 'moq', 'minimum', 'bulk', 'order', 'buy',
    'purchase', 'delivery', 'ship', 'quote', 'discount', 'sample', 'available',
    'stock', 'want', 'need', 'interested', 'when', 'how long',
  ];

  const coldSignals = ['hello', 'hi', 'hey', 'test', 'ok', 'thanks', 'bye'];

  const productNames = products.map(p => p.name.toLowerCase().split(' ')[0]);
  const mentionsProduct = productNames.some(name => msg.includes(name));

  const buyingScore = buyingSignals.filter(s => msg.includes(s)).length;
  const isCold = coldSignals.some(s => msg === s || msg === s + '!');

  if (isCold && buyingScore === 0) return 'cold';
  if (buyingScore >= 1 || mentionsProduct) return 'qualified';
  return 'inquiry';
}

module.exports = router;
