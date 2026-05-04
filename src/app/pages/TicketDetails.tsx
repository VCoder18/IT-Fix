'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

type TicketDetailsProps = {
  ticketId: string;
};

type Comment = {
  id: string;
  author: string;
  role: 'user' | 'admin';
  message: string;
  timestamp: string;
};

const isTicketStatus = (value: string): value is TicketStatus => {
  return value === 'Open' || value === 'In Progress' || value === 'Resolved' || value === 'Closed';
};

export default function TicketDetails({ ticketId }: TicketDetailsProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Smith',
      role: 'user',
      message: 'My laptop suddenly stopped turning on this morning. I tried holding the power button but nothing happens.',
      timestamp: '2026-05-04 09:30',
    },
    {
      id: '2',
      author: 'IT Support',
      role: 'admin',
      message: 'Thanks for reporting this. Can you check if the charging light is on when you plug in the charger?',
      timestamp: '2026-05-04 09:45',
    },
  ]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: 'IT Support',
          role: 'admin',
          message: newComment,
          timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      setNewComment('');
    }
  };

  const statusColors = {
    Open: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Resolved: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-100 text-gray-600',
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="max-w-5xl mx-auto py-8 px-6 text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="text-green-600 hover:text-green-700"
        >
          ← Dashboard
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <Link
          href="/"
          className="text-green-600 hover:text-green-700"
        >
          Home
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <Link
          href="/submit"
          className="text-green-600 hover:text-green-700"
        >
          Submit Ticket
        </Link>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-md p-8 mb-6 border border-slate-700">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl mb-2">Ticket #{ticketId}</h1>
            <h2 className="text-xl text-gray-300">Laptop won't turn on</h2>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800">
              High
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-700">
          <div>
            <div className="text-sm text-gray-400 mb-1">Submitted By</div>
            <div>John Smith</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Email</div>
            <div>john.smith@company.com</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Category</div>
            <div>Hardware</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Submitted At</div>
            <div>2026-05-04 09:30</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Description</div>
          <div className="text-gray-200">
            My laptop suddenly stopped turning on this morning. I was working on it last night and shut it down normally. When I tried to start it this morning, pressing the power button does nothing - no lights, no sounds, nothing. I've tried holding the power button for 30 seconds as suggested online but still no response.
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Update Status</label>
          <select
            value={status}
            onChange={(e) => {
              const nextStatus = e.target.value;
              if (isTicketStatus(nextStatus)) {
                setStatus(nextStatus);
              }
            }}
            className="px-4 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-md p-8 border border-slate-700">
        <h3 className="text-xl mb-6">Comments & Updates</h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-lg ${
                comment.role === 'admin' ? 'bg-blue-900 border border-blue-700' : 'bg-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{comment.author}</span>
                  {comment.role === 'admin' && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{comment.timestamp}</span>
              </div>
              <p className="text-gray-200">{comment.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment}>
          <label className="block text-sm text-gray-300 mb-2">Add Comment</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a note or update for this ticket..."
            rows={4}
            className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-3 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Add Comment
          </button>
        </form>
      </div>
    </main>
  );
}
