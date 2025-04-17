import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Mail, Phone, MapPin, Check, X } from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MemberProfileProps {
  memberId: string;
}

export function MemberProfile({ memberId }: MemberProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [memberId]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found</div>;

  const administrativeStatus = profile.administrative_status as {
    dues_paid: boolean;
    reports_submitted: boolean;
    active_grants: boolean;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>{profile.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {profile.full_name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge>{profile.role}</Badge>
                  <Badge variant="outline">{profile.member_type}</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="administrative">Administrative</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
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
                  <p>{profile.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </div>
                  <p>{profile.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    Country
                  </div>
                  <p>{profile.country || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500">
                    Languages
                  </div>
                  <div className="flex gap-1">
                    {profile.language?.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administrative">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {administrativeStatus.dues_paid ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Dues Payment</h4>
                      <p className="text-sm text-gray-500">Annual membership dues status</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {administrativeStatus.reports_submitted ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Reports Submission</h4>
                      <p className="text-sm text-gray-500">Required reports status</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Reports</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {administrativeStatus.active_grants ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Active Grants</h4>
                      <p className="text-sm text-gray-500">Current grant status</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage Grants</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expertise">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise_areas?.map((area) => (
                      <Badge key={area} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Work Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.key_work_areas?.map((area) => (
                      <Badge key={area}>{area}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}