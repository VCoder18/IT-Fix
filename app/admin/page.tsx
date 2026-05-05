"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Ticket = {
  id: string;
  short_id: string;
  title: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedBy: string;
  submittedAt: string;
};

// Mock tickets removed in favor of Supabase data

export default function AdminDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem('isAdmin');
    if (!adminAuth) {
      router.push('/login');
    } else {
      setIsAdmin(true);
      fetchTickets();
    }
  }, [router]);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        short_id,
        title,
        category,
        urgency,
        status,
        created_at,
        employees ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setTickets(
        data.map((t: any) => {
          let statusText = 'Open';
          if (t.status === 'taken') statusText = 'In Progress';
          if (t.status === 'closed') statusText = 'Closed';

          return {
            id: t.id,
            short_id: t.short_id || t.id.substring(0, 8),
            title: t.title,
            category: t.category,
            urgency: t.urgency,
            status: statusText as any,
            submittedBy: t.employees?.full_name || 'Unknown',
            submittedAt: new Date(t.created_at).toLocaleString(),
          };
        })
      );
    }
  };

  if (!isAdmin) return null;

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/login');
  };

  const urgencyVariants: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
    Low: "outline",
    Medium: "secondary",
    High: "default",
    Critical: "destructive",
  };

  const statusColors: Record<string, string> = {
    Open: 'bg-gray-500 hover:bg-gray-600',
    'In Progress': 'bg-blue-500 hover:bg-blue-600',
    Resolved: 'bg-green-500 hover:bg-green-600',
    Closed: 'bg-gray-800 hover:bg-gray-900',
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <main className="w-full py-8 px-6 md:px-12 lg:px-20 text-foreground bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-8 items-center">
          <Link href="/" className="px-4 py-2 rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium">
            Home
          </Link>
          <Link href="/submit" className="px-4 py-2 rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium">
            Submit Ticket
          </Link>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="px-6 h-10 font-bold shadow-lg hover:shadow-destructive/20 transition-all"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-300">{stats.open}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 w-full">
              <CardTitle className="text-xl text-foreground whitespace-nowrap">All Tickets</CardTitle>
              <div className="relative flex-1 max-w-md w-full">
                <input
                  type="text"
                  placeholder="Search tickets by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border border-border text-foreground px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-none"}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-gray-300 font-bold">Ticket ID</TableHead>
                  <TableHead className="text-gray-300 font-bold">Title</TableHead>
                  <TableHead className="text-gray-300 font-bold">Category</TableHead>
                  <TableHead className="text-gray-300 font-bold">Urgency</TableHead>
                  <TableHead className="text-gray-300 font-bold">Status</TableHead>
                  <TableHead className="text-gray-300 font-bold">Submitted By</TableHead>
                  <TableHead className="text-gray-300 font-bold">Date</TableHead>
                  <TableHead className="text-gray-300 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TableRow key={ticket.id} className="border-border hover:bg-muted/20">
                    <TableCell className="font-medium text-foreground">{ticket.short_id}</TableCell>
                    <TableCell className="text-foreground">{ticket.title}</TableCell>
                    <TableCell className="text-muted-foreground">{ticket.category}</TableCell>
                    <TableCell>
                      <Badge variant={urgencyVariants[ticket.urgency]}>
                        {ticket.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[ticket.status]} border-none text-white shadow-sm`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ticket.submittedBy}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{ticket.submittedAt}</TableCell>
                    <TableCell>
                      <Link
                        href={`/ticket/${ticket.id}`}
                        className="text-green-500 hover:text-green-400 font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      No tickets found for the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
