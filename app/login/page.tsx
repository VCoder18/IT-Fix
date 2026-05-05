"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ensureUserRole } from '@/lib/auth/ensure-user-role';

export default function UnifiedLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error');
    if (urlError) {
      setError(urlError);
    }

    const checkExistingSession = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      try {
        const role = await ensureUserRole(supabase, user);
        router.replace(role === 'technician' ? '/admin' : '/user-dashboard');
      } catch (metadataError) {
        const message =
          metadataError instanceof Error
            ? metadataError.message
            : 'Unable to resolve user role.';
        setError(message);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    const callbackUrl = `${window.location.origin}/api/auth/callback`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
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
            <CardDescription className="text-gray-300 text-lg mt-2">
              Sign in with your Google account
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10 space-y-6">
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-base">
                {error}
              </div>
            )}

            <Button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-medium rounded-xl"
            >
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
