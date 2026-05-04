'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Ticket = {
  id: string;
  title: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedBy: string;
  submittedAt: string;
};

const mockTickets: Ticket[] = [
  {
    id: 'A1B2C3D4',
    title: 'Laptop won\'t turn on',
    category: 'Hardware',
    urgency: 'High',
    status: 'In Progress',
    submittedBy: 'John Smith',
    submittedAt: '2026-05-04 09:30',
  },
  {
    id: 'E5F6G7H8',
    title: 'Cannot access email',
    category: 'Email',
    urgency: 'Medium',
    status: 'Open',
    submittedBy: 'Sarah Johnson',
    submittedAt: '2026-05-04 10:15',
  },
  {
    id: 'I9J0K1L2',
    title: 'Printer not responding',
    category: 'Hardware',
    urgency: 'Low',
    status: 'Open',
    submittedBy: 'Mike Davis',
    submittedAt: '2026-05-04 11:00',
  },
  {
    id: 'M3N4O5P6',
    title: 'VPN connection issues',
    category: 'Network',
    urgency: 'Critical',
    status: 'Open',
    submittedBy: 'Emily Chen',
    submittedAt: '2026-05-04 08:45',
  },
  {
    id: 'Q7R8S9T0',
    title: 'Software installation request',
    category: 'Software',
    urgency: 'Low',
    status: 'Resolved',
    submittedBy: 'David Wilson',
    submittedAt: '2026-05-03 14:20',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [filter, setFilter] = useState<string>('All');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/login');
  };

  const urgencyColors = {
    Low: 'bg-blue-100 text-blue-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    Open: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Resolved: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-100 text-gray-600',
  };

  const filteredTickets = filter === 'All'
    ? tickets
    : tickets.filter((t) => t.status === filter);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto py-8 px-6 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/"
            className="text-green-600 hover:text-green-700"
          >
            Home
          </Link>
          <Link
            href="/submit"
            className="text-green-600 hover:text-green-700"
          >
            Submit Ticket
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
          <div className="text-gray-600 text-sm mb-1">Total Tickets</div>
          <div className="text-3xl">{stats.total}</div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
          <div className="text-gray-600 text-sm mb-1">Open</div>
          <div className="text-3xl text-gray-800">{stats.open}</div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
          <div className="text-gray-600 text-sm mb-1">In Progress</div>
          <div className="text-3xl text-blue-600">{stats.inProgress}</div>
        </div>
        <div className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
          <div className="text-gray-600 text-sm mb-1">Resolved</div>
          <div className="text-3xl text-green-600">{stats.resolved}</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg shadow border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">All Tickets</h2>
            <div className="flex gap-2">
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-gray-200 hover:bg-slate-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {ticket.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {ticket.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${urgencyColors[ticket.urgency]}`}>
                      {ticket.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {ticket.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {ticket.submittedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/ticket/${ticket.id}`}
                      className="text-green-600 hover:text-green-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
