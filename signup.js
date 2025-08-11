import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Load env variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, phone, github, country, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          phone,
          github,
          country
        }
      }
    });

    if (error) throw error;

    res.json({ message: 'Please confirm your email for instant verification.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
