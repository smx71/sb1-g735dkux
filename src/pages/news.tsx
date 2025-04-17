import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NewsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Our News Section</CardTitle>
            <CardDescription>Stay up to date with our latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p>News content will be populated here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}