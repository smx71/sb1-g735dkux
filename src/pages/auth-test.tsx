import { AuthTest } from "@/components/auth/auth-test";

export function AuthTestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-center mb-8">Auth Test Page</h1>
      <AuthTest />
    </div>
  );
}