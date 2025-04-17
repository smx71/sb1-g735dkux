import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MeetingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-wilpf-primary mb-8">Meetings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No upcoming meetings</p>
          {/* Add meeting list here */}
        </CardContent>
      </Card>
    </div>
  );
}