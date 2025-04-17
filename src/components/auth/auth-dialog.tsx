import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';
import { toast } from 'sonner';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof authSchema>) {
    setIsLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'signin') {
        const { error } = await signIn(values.email, values.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again or sign up if you don\'t have an account.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and confirm your account before signing in.');
          } else {
            setError(error.message || 'Failed to sign in');
          }
          return;
        }
        toast.success('Signed in successfully');
        onClose();
        // Immediately redirect to profile page after successful sign in
        navigate('/dashboard/profile');
      } else {
        const { error } = await signUp(values.email, values.password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message || 'Failed to sign up');
          }
          return;
        }
        toast.success('Please check your email to confirm your account');
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to WILPF</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'signin' | 'signup');
          setError(null);
          form.reset();
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter your email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Enter your password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}