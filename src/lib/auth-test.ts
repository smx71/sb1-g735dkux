import { supabase } from './supabase';

async function testSignUp() {
  console.log('Testing Sign Up...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@wilpf.org',
    password: 'Test1234!',
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });
  console.log('Sign Up Result:', { data, error });
  return { data, error };
}

async function testSignIn() {
  console.log('Testing Sign In...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@wilpf.org',
    password: 'Test1234!'
  });
  console.log('Sign In Result:', { data, error });
  return { data, error };
}

async function testSession() {
  console.log('Testing Session...');
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Session Result:', { session, error });
  return { session, error };
}

export async function runAuthTests() {
  console.log('Starting Auth Tests...');
  
  // Test current session
  await testSession();
  
  // Test sign in
  await testSignIn();
  
  // Test sign up
  await testSignUp();
  
  console.log('Auth Tests Complete');
}