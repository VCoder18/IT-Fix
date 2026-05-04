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
    <main className="max-w-md mx-auto py-16 px-6">
      <Card className="bg-slate-800 border-slate-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl text-white">Login</CardTitle>
          <CardDescription className="text-gray-300">Sign in to access your portal</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-green-500 hover:text-green-400 text-sm">
                ← Back to Home
              </Link>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-slate-700 pt-6 space-y-4">
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
    </main>
  );
}
