import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organization: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  contact_type: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

interface ContactFormProps {
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name || '',
      organization: contact?.organization || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      contact_type: contact?.contact_type || 'donor',
      notes: contact?.notes || '',
      tags: contact?.tags || [],
    },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    setLoading(true);
    try {
      if (contact?.id) {
        const { error } = await supabase
          .from('contacts')
          .update(values)
          .eq('id', contact.id);
        
        if (error) throw error;
        toast.success('Contact updated successfully');
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([values]);
        
        if (error) throw error;
        toast.success('Contact created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="peer">Peer</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </Form>
  );
}