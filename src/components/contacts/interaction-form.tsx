import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const interactionSchema = z.object({
  interaction_type: z.string(),
  description: z.string().min(1, 'Description is required'),
  date: z.string(),
});

interface InteractionFormProps {
  contactId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InteractionForm({ contactId, onSuccess, onCancel }: InteractionFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof interactionSchema>>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: 'meeting',
      description: '',
      date: new Date().toISOString(),
    },
  });

  async function onSubmit(values: z.infer<typeof interactionSchema>) {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_interactions')
        .insert([{
          ...values,
          contact_id: contactId,
        }]);
      
      if (error) throw error;
      toast.success('Interaction added successfully');
      onSuccess();
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast.error('Failed to add interaction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="interaction_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
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
            {loading ? 'Adding...' : 'Add Interaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
}