import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InteractionForm } from './interaction-form';
import type { Database } from '@/lib/database.types';

type Interaction = Database['public']['Tables']['contact_interactions']['Row'];

interface ContactInteractionsProps {
  contactId: string;
}

export function ContactInteractions({ contactId }: ContactInteractionsProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchInteractions();
  }, [contactId]);

  async function fetchInteractions() {
    try {
      const { data, error } = await supabase
        .from('contact_interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('date', { ascending: false });

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleInteractionSuccess() {
    setIsDialogOpen(false);
    fetchInteractions();
  }

  if (loading) return <div>Loading interactions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Interaction History</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Interaction</DialogTitle>
            </DialogHeader>
            <InteractionForm
              contactId={contactId}
              onSuccess={handleInteractionSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {interactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No interactions recorded yet.
            </CardContent>
          </Card>
        ) : (
          interactions.map((interaction) => (
            <Card key={interaction.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{interaction.interaction_type}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(interaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{interaction.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}