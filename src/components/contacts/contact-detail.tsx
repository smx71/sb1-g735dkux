import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';
import { ContactInteractions } from './contact-interactions';
import type { Database } from '@/lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactDetailProps {
  contactId: string;
  onEdit: () => void;
}

export function ContactDetail({ contactId, onEdit }: ContactDetailProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  async function fetchContact() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading contact details...</div>;
  if (!contact) return <div>Contact not found</div>;

  const address = contact.address as { street?: string; city?: string; country?: string } | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {contact.name}
              </CardTitle>
              {contact.organization && (
                <div className="flex items-center text-gray-500 mt-1">
                  <Building2 className="h-4 w-4 mr-1" />
                  {contact.organization}
                </div>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge>{contact.contact_type}</Badge>
                <Badge variant="outline">{contact.status}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </div>
                  <p>{contact.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </div>
                  <p>{contact.phone || 'Not provided'}</p>
                </div>
                {address && (
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      Address
                    </div>
                    <p>
                      {[address.street, address.city, address.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Added
                  </div>
                  <p>{new Date(contact.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <ContactInteractions contactId={contact.id} />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 whitespace-pre-wrap">
                {contact.notes || 'No notes available.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}