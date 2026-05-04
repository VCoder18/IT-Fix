"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  title: string;
  description: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedAt: string;
  assignedTo?: string;
};

const mockUserTickets: Ticket[] = [
  {
    id: 'A1B2C3D4',
    title: 'Laptop won\'t turn on',
    description: 'My laptop suddenly stopped turning on this morning.',
    category: 'Hardware',
    urgency: 'High',
    status: 'In Progress',
    submittedAt: '2026-05-04 09:30',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'X9Y8Z7W6',
    title: 'Email not syncing',
    description: 'My Outlook emails are not syncing across devices.',
    category: 'Email',
    urgency: 'Medium',
    status: 'Open',
    submittedAt: '2026-05-03 14:20',
  },
  {
    id: 'P5Q4R3S2',
    title: 'VPN connection dropping',
    description: 'VPN keeps disconnecting every few minutes.',
    category: 'Network',
    urgency: 'High',
    status: 'Resolved',
    submittedAt: '2026-05-02 11:15',
    assignedTo: 'Michael Chen',
  },
];

export default function UserDashboard() {
  const router = useRouter();
  const [tickets] = useState<Ticket[]>(mockUserTickets);
  const [filter, setFilter] = useState<string>('All');
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const userAuth = localStorage.getItem('isUser');
    if (!userAuth) {
      router.push('/login');
    } else {
      setIsUser(true);
    }
  }, [router]);

  if (!isUser) return null;

  const handleLogout = () => {
    localStorage.removeItem('isUser');
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

  const filteredTickets = filter === 'All'
    ? tickets
    : tickets.filter(t => t.status === filter);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <main className="max-w-7xl mx-auto py-8 px-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <div className="flex flex-wrap gap-4 items-center">
          <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
            Home
          </Link>
          <Link href="/submit" className="text-green-600 hover:text-green-700 font-medium">
            Submit New Ticket
          </Link>
          <Link href="/technicians" className="text-green-600 hover:text-green-700 font-medium">
            Browse Technicians
          </Link>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="transition-colors"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-300">{stats.open}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-400 text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl text-white">Your Tickets</CardTitle>
            <div className="flex flex-wrap gap-2">
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-green-600 hover:bg-green-700" : "bg-slate-700 text-gray-200 hover:bg-slate-600 border-none"}
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
              <TableHeader className="bg-slate-700/50">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-gray-300 font-bold">Ticket ID</TableHead>
                  <TableHead className="text-gray-300 font-bold">Title</TableHead>
                  <TableHead className="text-gray-300 font-bold">Category</TableHead>
                  <TableHead className="text-gray-300 font-bold">Urgency</TableHead>
                  <TableHead className="text-gray-300 font-bold">Status</TableHead>
                  <TableHead className="text-gray-300 font-bold">Assigned To</TableHead>
                  <TableHead className="text-gray-300 font-bold">Date</TableHead>
                  <TableHead className="text-gray-300 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => (
                  <TableRow key={ticket.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="font-medium text-white">{ticket.id}</TableCell>
                    <TableCell className="text-white">{ticket.title}</TableCell>
                    <TableCell className="text-gray-300">{ticket.category}</TableCell>
                    <TableCell>
                      <Badge variant={urgencyVariants[ticket.urgency]}>
                        {ticket.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[ticket.status]} border-none text-white`}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{ticket.assignedTo || '-'}</TableCell>
                    <TableCell className="text-gray-300 whitespace-nowrap">{ticket.submittedAt}</TableCell>
                    <TableCell>
                      <Link
                        href={`/user-ticket/${ticket.id}`}
                        className="text-green-500 hover:text-green-400 font-medium"
                      >
                        View/Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      No tickets found.
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
