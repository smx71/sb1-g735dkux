import { supabase } from './supabase';
import { toast } from 'sonner';

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Email not confirmed') {
        throw new Error('Please confirm your email address before signing in');
      } else if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in';
    toast.error(message);
    return { data: null, error };
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('An account with this email already exists');
      }
      throw error;
    }

    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
      throw new Error('An account with this email already exists but is not confirmed');
    }

    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign up';
    toast.error(message);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    toast.error('Failed to sign out');
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    return null;
  }
}