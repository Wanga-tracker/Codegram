router.post('/signup', async (req, res) => {
  const { name, username, email, phone, github, country, password } = req.body;

  // Create auth account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });
  if (authError) return res.status(400).json({ error: authError.message });

  // Store extra profile info
  const { error: dbError } = await supabase
    .from('profiles')
    .insert([{ 
      id: authData.user.id,
      name,
      username,
      email,
      phone,
      github,
      country
    }]);

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.json({ message: 'Signup successful' });
});
