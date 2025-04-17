import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Globe, Building2, BookOpen } from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  language: z.array(z.string()).optional(),
  expertise_areas: z.array(z.string()).optional(),
  key_work_areas: z.array(z.string()).optional(),
  member_type: z.string(),
});

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'ar', label: 'Arabic' },
];

const expertiseAreas = [
  'Peace Building',
  'Disarmament',
  'Human Rights',
  'Gender Equality',
  'Environmental Justice',
  'Social Justice',
  'International Law',
  'Advocacy',
];

const workAreas = [
  'Research',
  'Advocacy',
  'Community Organizing',
  'Policy Making',
  'Education',
  'Communications',
  'Project Management',
];

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      bio: '',
      phone: '',
      country: '',
      language: ['en'],
      expertise_areas: [],
      key_work_areas: [],
      member_type: 'individual',
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
      form.reset({
        full_name: data.full_name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        country: data.country || '',
        language: data.language || ['en'],
        expertise_areas: data.expertise_areas || [],
        key_work_areas: data.key_work_areas || [],
        member_type: data.member_type || 'individual',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user!.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wilpf-primary">Profile Settings</h1>
          <p className="text-wilpf-gray-600 mt-1">
            Manage your profile information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>{profile?.full_name?.charAt(0) || 'M'}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
              <p className="text-wilpf-gray-600">{profile?.member_type}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-wilpf-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              {profile?.phone && (
                <div className="flex items-center text-wilpf-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {profile.phone}
                </div>
              )}
              {profile?.country && (
                <div className="flex items-center text-wilpf-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {profile.country}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
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
                      name="member_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select member type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="organization">Organization</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="expertise">Expertise</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile?.bio && (
                      <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-wilpf-gray-600">{profile.bio}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-wilpf-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {user?.email}
                          </div>
                          {profile?.phone && (
                            <div className="flex items-center text-wilpf-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {profile.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <div className="space-y-2">
                          {profile?.country && (
                            <div className="flex items-center text-wilpf-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {profile.country}
                            </div>
                          )}
                          {profile?.language && (
                            <div className="flex items-center text-wilpf-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              {profile.language.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expertise">
                <Card>
                  <CardHeader>
                    <CardTitle>Expertise & Work Areas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Areas of Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.expertise_areas?.map((area) => (
                          <div
                            key={area}
                            className="px-3 py-1 bg-wilpf-sage/10 text-wilpf-sage rounded-full text-sm"
                          >
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Key Work Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile?.key_work_areas?.map((area) => (
                          <div
                            key={area}
                            className="px-3 py-1 bg-wilpf-sky/10 text-wilpf-sky rounded-full text-sm"
                          >
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add communication preferences here */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}