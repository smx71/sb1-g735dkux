import { supabase } from './supabase';

async function testAuth() {
  try {
    console.log('Testing Supabase Auth API...');
    
    // Test sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser@example.com',
      password: 'Test1234!'
    });

    console.log('\nSign Up Test:');
    console.log('Data:', signUpData);
    console.log('Error:', signUpError);

    // Test sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'testuser@example.com',
      password: 'Test1234!'
    });

    console.log('\nSign In Test:');
    console.log('Data:', signInData);
    console.log('Error:', signInError);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuth();