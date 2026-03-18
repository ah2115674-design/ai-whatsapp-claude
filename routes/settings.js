const express = require('express');
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// ── GET /api/settings ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('whatsapp_number, twilio_sid, ai_name, ai_greeting')
      // NOTE: we deliberately omit twilio_auth_token from GET responses
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return res.json({ settings: data || {} });
  } catch (err) {
    console.error('[get settings]', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ── POST /save-whatsapp  (also available as PUT /api/settings) ────────────────
// Handles both paths to match the frontend
async function saveWhatsApp(req, res) {
  try {
    const { whatsappNumber, twilioSid, twilioAuthToken, aiName, aiGreeting } = req.body;

    if (!whatsappNumber) {
      return res.status(400).json({ error: 'whatsappNumber is required' });
    }

    const upsertData = {
      user_id: req.user.id,
      whatsapp_number: whatsappNumber.trim(),
      twilio_sid: twilioSid?.trim() || '',
      ai_name: aiName?.trim() || 'Zara',
      ai_greeting: aiGreeting?.trim() || 'Hello! How can I help you today?',
      updated_at: new Date().toISOString(),
    };

    // Only update auth token if provided (avoid overwriting with empty string)
    if (twilioAuthToken) {
      upsertData.twilio_auth_token = twilioAuthToken.trim();
    }

    const { data, error } = await supabase
      .from('settings')
      .upsert(upsertData, { onConflict: 'user_id' })
      .select('whatsapp_number, twilio_sid, ai_name, ai_greeting')
      .single();

    if (error) throw error;
    return res.json({ settings: data, message: 'WhatsApp settings saved' });
  } catch (err) {
    console.error('[save whatsapp]', err);
    return res.status(500).json({ error: 'Failed to save WhatsApp settings' });
  }
}

router.post('/', saveWhatsApp);
router.put('/', saveWhatsApp);

module.exports = router;
