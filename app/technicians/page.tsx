"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Technician = Pick<Tables<'technicians'>, 'id' | 'full_name' | 'email' | 'bio' | 'status'>;

function toAvailabilityLabel(status: Technician['status']): 'Available' | 'Busy' | 'Offline' {
  if (status === 'available') return 'Available';
  if (status === 'busy') return 'Busy';
  return 'Offline';
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  useEffect(() => {
    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, full_name, email, bio, status')
        .order('full_name', { ascending: true });

      if (!error && data) {
        setTechnicians(data);
      }

      setLoading(false);
    };

    fetchTechnicians();
  }, []);

  const allAvailabilities = Array.from(
    new Set(technicians.map((tech) => toAvailabilityLabel(tech.status)))
  );

  const filteredTechnicians = technicians.filter(tech => {
    const availability = toAvailabilityLabel(tech.status);
    const matchesSearch =
      tech.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tech.bio ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAvailability =
      selectedAvailability === 'All' ||
      availability === selectedAvailability;

    return matchesSearch && matchesAvailability;
  });

  const availabilityColors: Record<string, string> = {
    Available: 'bg-emerald-500 text-white',
    Busy: 'bg-amber-500 text-white',
    Offline: 'bg-slate-500 text-white',
  };

  return (
    <main className="w-full py-8 px-6 md:px-12 lg:px-20 text-foreground bg-background">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
          ← Home
        </Link>
      </div>

      <h1 className="text-3xl mb-6 text-foreground">Browse Technicians</h1>

      <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-muted-foreground mb-2 text-sm">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or bio..."
              className="w-full px-4 py-3 border border-border bg-muted/50 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-foreground mb-2 text-sm">Filter by Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-muted/50 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="All">All</option>
              {allAvailabilities.map(availability => (
                <option key={availability} value={availability}>{availability}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading technicians...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map(tech => (
          <Card key={tech.id} className="bg-card border-border flex flex-col h-full hover:border-primary/50 transition-colors shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {tech.full_name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{tech.full_name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{tech.email}</CardDescription>
                  </div>
                </div>
                <Badge className={`${availabilityColors[toAvailabilityLabel(tech.status)]} border-none rounded-full px-3 py-1 font-medium shadow-sm`}>
                  {toAvailabilityLabel(tech.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 italic">
                &ldquo;{tech.bio || 'No bio provided yet.'}&rdquo;
              </p>

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Role</p>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-muted text-foreground text-[10px] py-0 px-2"
                  >
                    Technician
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href={`/submit?technician=${tech.id}`}>
                  Submit Ticket to {tech.full_name.split(' ')[0]}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && filteredTechnicians.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
          No technicians found matching your criteria.
        </div>
      )}
    </main>
  );
}
