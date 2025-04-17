import { useState } from "react";
import { runAuthTests } from "@/lib/auth-test";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle } from "lucide-react";

export function AuthTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setLogs([]);

    // Override console.log to capture logs
    const originalLog = console.log;
    console.log = (...args) => {
      setLogs(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')]);
      originalLog.apply(console, args);
    };

    try {
      await runAuthTests();
    } catch (error) {
      console.log('Test Error:', error);
    } finally {
      // Restore original console.log
      console.log = originalLog;
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Supabase Auth Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTest}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Running Tests..." : "Run Auth Tests"}
        </Button>

        {logs.length > 0 && (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <pre className="text-sm">
              {logs.join('\n')}
            </pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}