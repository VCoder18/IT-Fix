"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ensureUserRole } from '@/lib/auth/ensure-user-role';
import type { Tables } from '@/lib/database';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from '@/components/ui/label';

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

type TicketRow = Pick<
  Tables<'tickets'>,
  'id' | 'short_id' | 'title' | 'category' | 'urgency' | 'status' | 'created_at'
> & {
  employees:
    | Pick<Tables<'employees'>, 'full_name'>
    | Pick<Tables<'employees'>, 'full_name'>[]
    | null;
};

type TechnicianStatus = Tables<'technicians'>['status'];

function getSubmittedBy(
  relation:
    | Pick<Tables<'employees'>, 'full_name'>
    | Pick<Tables<'employees'>, 'full_name'>[]
    | null
): string {
  if (!relation) return 'Unknown';
  return Array.isArray(relation) ? (relation[0]?.full_name ?? 'Unknown') : relation.full_name;
}

function toStatusLabel(status: Tables<'tickets'>['status']): Ticket['status'] {
  if (status === 'taken') return 'In Progress';
  if (status === 'closed') return 'Closed';
  return 'Open';
}

function toUrgencyLabel(urgency: string): Ticket['urgency'] {
  const normalized = urgency.toLowerCase();
  if (normalized === 'low') return 'Low';
  if (normalized === 'high') return 'High';
  if (normalized === 'critical') return 'Critical';
  return 'Medium';
}

function toTechnicianStatusValue(status: string): TechnicianStatus | null {
  if (status === 'available' || status === 'busy' || status === 'absent') {
    return status;
  }
  return null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState<TechnicianStatus>('available');
  const [isUpdatingAdminStatus, setIsUpdatingAdminStatus] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsAdmin(false);
        router.replace('/login');
        return;
      }

      try {
        const role = await ensureUserRole(supabase, user);
        if (role !== 'technician') {
          setIsAdmin(false);
          router.replace('/login');
          return;
        }

        setCurrentUserId(user.id);
        setIsAdmin(true);
        fetchAdminStatus(user.id);
        fetchTickets();
      } catch (error) {
        const message =
          error instanceof Error
            ? encodeURIComponent(error.message)
            : 'Unable%20to%20resolve%20user%20role';
        setIsAdmin(false);
        router.replace(`/login?error=${message}`);
      }
    };

    checkAdminAccess();
  }, [router]);

  const fetchAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('technicians')
      .select('status')
      .eq('id', userId)
      .single();

    if (data?.status) {
      setAdminStatus(data.status);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/login');
    }
  };

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
      const rows = data as TicketRow[];
      setTickets(
        rows.map((t) => {
          return {
            id: t.id,
            short_id: t.short_id || t.id.substring(0, 8),
            title: t.title,
            category: t.category,
            urgency: toUrgencyLabel(t.urgency),
            status: toStatusLabel(t.status),
            submittedBy: getSubmittedBy(t.employees),
            submittedAt: t.created_at ? new Date(t.created_at).toLocaleString() : '-',
          };
        })
      );
    }
  };

  const handleAdminStatusChange = async (value: string) => {
    const nextStatus = toTechnicianStatusValue(value);
    if (!nextStatus || !currentUserId) return;

    const previousStatus = adminStatus;
    setAdminStatus(nextStatus);
    setIsUpdatingAdminStatus(true);

    const { error } = await supabase
      .from('technicians')
      .update({ status: nextStatus })
      .eq('id', currentUserId);

    if (error) {
      setAdminStatus(previousStatus);
    }

    setIsUpdatingAdminStatus(false);
  };

  const urgencyVariants: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
    Low: "outline",
    Medium: "secondary",
    High: "default",
    Critical: "destructive",
  };

  const statusColors: Record<string, string> = {
    Open: '!bg-gray-500 !text-white',
    'In Progress': '!bg-blue-500 !text-white',
    Resolved: '!bg-green-500 !text-white',
    Closed: '!bg-gray-800 !text-white',
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

  if (isAdmin !== true) return null;

  return (
    <main className="w-full py-8 px-6 md:px-12 lg:px-20 text-foreground bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Label htmlFor="admin-status-select" className="text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              My Status
            </Label>
            <Select value={adminStatus} onValueChange={handleAdminStatusChange}>
              <SelectTrigger
                id="admin-status-select"
                disabled={isUpdatingAdminStatus}
                className="w-[170px] bg-muted border-border text-foreground"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="absent">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-300">{stats.open}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-md">
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
          <div className="max-h-[560px] overflow-auto">
            <Table className="table-fixed min-w-[1290px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[120px] px-4 md:px-6 text-gray-300 font-bold">Ticket ID</TableHead>
                  <TableHead className="w-[240px] px-4 md:px-6 text-gray-300 font-bold">Title</TableHead>
                  <TableHead className="w-[150px] px-4 md:px-6 text-gray-300 font-bold">Category</TableHead>
                  <TableHead className="w-[110px] px-4 md:px-6 text-gray-300 font-bold">Urgency</TableHead>
                  <TableHead className="w-[130px] px-4 md:px-6 text-gray-300 font-bold">Status</TableHead>
                  <TableHead className="w-[170px] px-4 md:px-6 text-gray-300 font-bold">Submitted By</TableHead>
                  <TableHead className="w-[180px] px-4 md:px-6 text-gray-300 font-bold">Date</TableHead>
                  <TableHead className="w-[190px] px-4 md:px-6 text-center text-gray-300 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TableRow key={ticket.id} className="border-border hover:bg-muted/20">
                    <TableCell className="px-4 md:px-6 font-medium text-foreground">{ticket.short_id}</TableCell>
                    <TableCell className="px-4 md:px-6 text-foreground">{ticket.title}</TableCell>
                    <TableCell className="px-4 md:px-6 text-muted-foreground">{ticket.category}</TableCell>
                    <TableCell className="px-4 md:px-6">
                      <Badge variant={urgencyVariants[ticket.urgency]}>
                        {ticket.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 md:px-6">
                      <Badge className={`${statusColors[ticket.status]} border-none shadow-sm`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 md:px-6 text-muted-foreground">{ticket.submittedBy}</TableCell>
                    <TableCell className="px-4 md:px-6 text-muted-foreground whitespace-nowrap">{ticket.submittedAt}</TableCell>
                    <TableCell className="px-4 md:px-6 text-center">
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
                    <TableCell colSpan={8} className="px-4 md:px-6 text-center py-8 text-gray-400">
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
