const express = require('express');
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// ── GET /api/leads ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ leads: data });
  } catch (err) {
    console.error('[get leads]', err);
    return res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// ── GET /api/leads/export ─────────────────────────────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const header = 'id,phone,inquiry,ai_reply,status,created_at\n';
    const rows = data.map(l =>
      [l.id, l.customer_phone, `"${(l.inquiry_text || '').replace(/"/g, '""')}"`,
       `"${(l.ai_reply || '').replace(/"/g, '""')}"`, l.status, l.created_at].join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.send(header + rows);
  } catch (err) {
    console.error('[export leads]', err);
    return res.status(500).json({ error: 'Failed to export leads' });
  }
});

// ── PUT /api/leads/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['inquiry', 'qualified', 'cold'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Lead not found' });
    return res.json({ lead: data });
  } catch (err) {
    console.error('[update lead]', err);
    return res.status(500).json({ error: 'Failed to update lead' });
  }
});

// ── DELETE /api/leads/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    return res.json({ message: 'Lead deleted' });
  } catch (err) {
    console.error('[delete lead]', err);
    return res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// ── DELETE /api/leads ─────────────────────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;
    return res.json({ message: 'All leads deleted' });
  } catch (err) {
    console.error('[delete all leads]', err);
    return res.status(500).json({ error: 'Failed to delete leads' });
  }
});

// ── GET /api/leads/dashboard ──────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('status, created_at')
      .eq('user_id', req.user.id);

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('user_id', req.user.id)
      .eq('status', 'active');

    if (leadsError || prodError) throw leadsError || prodError;

    const total = leads.length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const conversion = total ? Math.round((qualified / total) * 100) : 0;

    // Last 7 days breakdown
    const now = new Date();
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const dayLeads = leads.filter(l => l.created_at.startsWith(dateStr));
      return {
        date: dateStr,
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        inquiries: dayLeads.length,
        qualified: dayLeads.filter(l => l.status === 'qualified').length,
      };
    });

    return res.json({
      totalLeads: total,
      qualifiedLeads: qualified,
      conversionRate: conversion,
      activeProducts: products?.length || 0,
      weeklyActivity: weekData,
    });
  } catch (err) {
    console.error('[dashboard]', err);
    return res.status(500).json({ error: 'Failed to compute dashboard metrics' });
  }
});

module.exports = router;
