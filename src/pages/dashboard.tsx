import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Clock,
  ChevronRight,
  UserCheck,
  CalendarCheck,
  FileText,
} from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Meeting = Database['public']['Tables']['zoom_meetings']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      // Fetch upcoming meetings
      const { data: meetingsData } = await supabase
        .from('zoom_meetings')
        .select('*')
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);

      // Fetch recent notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setProfile(profileData);
      setUpcomingMeetings(meetingsData || []);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wilpf-primary">
            Welcome back, {profile?.full_name || 'Member'}
          </h1>
          <p className="text-wilpf-gray-600 mt-1">
            Here's what's happening in your WILPF community
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>{profile?.full_name?.charAt(0) || 'M'}</AvatarFallback>
        </Avatar>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wilpf-gray-600">Member Status</p>
                <p className="text-2xl font-bold text-wilpf-primary mt-1">Active</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-wilpf-sage/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-wilpf-sage" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wilpf-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-wilpf-primary mt-1">{upcomingMeetings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-wilpf-sky/10 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-wilpf-sky" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wilpf-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-wilpf-primary mt-1">{notifications.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-wilpf-coral/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-wilpf-coral" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-wilpf-gray-600">Documents</p>
                <p className="text-2xl font-bold text-wilpf-primary mt-1">12</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-wilpf-lavender/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-wilpf-lavender" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Meetings</CardTitle>
              <Button variant="ghost" size="sm" className="text-wilpf-primary">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <p className="text-wilpf-gray-600">No upcoming meetings</p>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-start space-x-4 p-3 rounded-lg bg-wilpf-gray-50"
                  >
                    <div className="h-10 w-10 rounded-full bg-wilpf-sky/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-wilpf-sky" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-wilpf-primary truncate">
                        {meeting.title}
                      </p>
                      <div className="flex items-center mt-1 text-sm text-wilpf-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(meeting.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline">{meeting.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Notifications</CardTitle>
              <Button variant="ghost" size="sm" className="text-wilpf-primary">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-wilpf-gray-600">No new notifications</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-3 rounded-lg bg-wilpf-gray-50"
                  >
                    <div className="h-10 w-10 rounded-full bg-wilpf-coral/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-wilpf-coral" />
                    </div>
                    <div>
                      <p className="font-medium text-wilpf-primary">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-wilpf-gray-600">
                        {notification.content}
                      </p>
                      <p className="mt-1 text-xs text-wilpf-gray-400">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}