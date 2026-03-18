const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

const router = express.Router();

// ── POST /api/signup ──────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, company, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'firstName, lastName, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if email already registered
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company: company?.trim() || '',
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '',
        password_hash: passwordHash,
      })
      .select('id, first_name, last_name, company, email, phone')
      .single();

    if (error) throw error;

    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// ── POST /api/login ───────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, company, email, phone, password_hash')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── PUT /api/user ─────────────────────────────────────────────────────────────
const authMiddleware = require('../middleware/auth');

router.put('/user', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, company, phone } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        first_name: firstName?.trim(),
        last_name: lastName?.trim(),
        company: company?.trim(),
        phone: phone?.trim(),
      })
      .eq('id', req.user.id)
      .select('id, first_name, last_name, company, email, phone')
      .single();

    if (error) throw error;
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[update user]', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── PUT /api/user/password ────────────────────────────────────────────────────
router.put('/user/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await supabase.from('users').update({ password_hash: newHash }).eq('id', req.user.id);

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[change password]', err);
    return res.status(500).json({ error: 'Failed to update password' });
  }
});

// ── DELETE /api/user ──────────────────────────────────────────────────────────
router.delete('/user', authMiddleware, async (req, res) => {
  try {
    // Cascade deletes products, leads, settings (set up in Supabase via FK ON DELETE CASCADE)
    await supabase.from('users').delete().eq('id', req.user.id);
    return res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('[delete user]', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    company: user.company,
    email: user.email,
    phone: user.phone,
  };
}

module.exports = router;
