const express = require('express');
const supabase = require('../lib/supabase');
const auth = require('../middleware/auth');

const router = express.Router();

// All product routes require authentication
router.use(auth);

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ products: data });
  } catch (err) {
    console.error('[get products]', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ── POST /api/products ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, price, moq, description, delivery } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        price: price.trim(),
        moq: moq?.trim() || '',
        description: description?.trim() || '',
        delivery: delivery?.trim() || '',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ product: data });
  } catch (err) {
    console.error('[create product]', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, price, moq, description, delivery, status } = req.body;

    // Verify ownership before update
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { data, error } = await supabase
      .from('products')
      .update({
        name: name?.trim(),
        price: price?.trim(),
        moq: moq?.trim(),
        description: description?.trim(),
        delivery: delivery?.trim(),
        status,
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ product: data });
  } catch (err) {
    console.error('[update product]', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('[delete product]', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
