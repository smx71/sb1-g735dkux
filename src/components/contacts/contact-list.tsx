import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, UserPlus, Building2, Phone, Mail } from 'lucide-react';
import { ContactForm } from './contact-form';
import { ContactDetail } from './contact-detail';
import type { Database } from '@/lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return selectedType === 'all' ? matchesSearch : matchesSearch && contact.contact_type === selectedType;
  });

  const contactTypes = ['donor', 'partner', 'peer', 'provider'];

  function handleAddSuccess() {
    setIsAddDialogOpen(false);
    fetchContacts();
  }

  function handleEditSuccess() {
    setIsEditDialogOpen(false);
    fetchContacts();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
            >
              All
            </Button>
            {contactTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-wilpf-blue hover:bg-wilpf-teal">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <ContactForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {selectedContact ? (
        <>
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedContact(null)}
          >
            ← Back to Contact List
          </Button>
          <ContactDetail
            contactId={selectedContact}
            onEdit={() => setIsEditDialogOpen(true)}
          />
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
              </DialogHeader>
              <ContactForm
                contact={contacts.find(c => c.id === selectedContact)}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading contacts...</p>
          ) : (
            filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(contact.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {contact.name}
                      </CardTitle>
                      {contact.organization && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Building2 className="h-4 w-4 mr-1" />
                          {contact.organization}
                        </div>
                      )}
                    </div>
                    <Badge>
                      {contact.contact_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}