const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envRaw = fs.readFileSync('.env.local', 'utf8');
const env = envRaw
  .split(/\r?\n/)
  .filter(Boolean)
  .reduce((acc, line) => {
    const [key, ...rest] = line.split('=');
    acc[key] = rest.join('=');
    return acc;
  }, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const email = `test+${Date.now()}@example.com`;
  const password = 'Test1234!';
  console.log('Testing signup for:', email);

  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
  console.log('signupError:', signupError ? signupError.message : 'none');
  console.log('signupData:', JSON.stringify(signupData, null, 2));

  if (!signupError) {
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({ email, password });
    console.log('signinError:', signinError ? signinError.message : 'none');
    console.log('signinData:', JSON.stringify(signinData, null, 2));
  }
})();
