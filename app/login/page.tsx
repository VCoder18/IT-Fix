"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function UnifiedLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Unified authentication check
    setTimeout(() => {
      if (formData.email === 'admin@itfix.com' && formData.password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        localStorage.removeItem('isUser');
        router.push('/admin');
      } else if (formData.email === 'user@company.com' && formData.password === 'user123') {
        localStorage.setItem('isUser', 'true');
        localStorage.setItem('userEmail', formData.email);
        localStorage.removeItem('isAdmin');
        router.push('/user-dashboard');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 relative bg-background text-foreground">
      <Link 
        href="/" 
        className="absolute top-6 left-6 text-green-600 hover:text-green-700 text-base font-medium flex items-center gap-2 z-10 bg-card p-2 rounded-lg shadow-sm border border-border"
      >
        <span>←</span> Back to Home
      </Link>

      <div className="w-full max-w-2xl">
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="text-center pt-10 px-8 pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl text-white font-bold tracking-tight">Login</CardTitle>
            <CardDescription className="text-gray-300 text-lg mt-2">Sign in to access your portal</CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-base">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-foreground text-base font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground h-14 text-lg px-4 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-foreground text-base font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground h-14 text-lg px-4 focus-visible:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-medium rounded-xl mt-4"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>

        <CardFooter className="flex flex-col border-t border-border p-8 space-y-4 bg-muted/50 rounded-b-xl">
          <div className="text-xs text-gray-400 text-center space-y-2">
            <p>Demo credentials:</p>
            <p>
              <span className="text-blue-400">Technician:</span> admin@itfix.com / admin123
            </p>
            <p>
              <span className="text-green-400">User:</span> user@company.com / user123
            </p>
          </div>
        </CardFooter>
        </Card>
      </div>
    </main>
  );
}
