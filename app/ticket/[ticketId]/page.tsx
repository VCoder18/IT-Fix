"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

type Comment = {
  id: string;
  author: string;
  role: 'user' | 'admin';
  message: string;
  timestamp: string;
};

export default function TicketDetails() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Resolved' | 'Closed'>('Open');
  const [newComment, setNewComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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
    const adminAuth = localStorage.getItem('isAdmin');
    if (!adminAuth) {
      router.push('/login');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (!isAdmin) return null;

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

  const statusColors: Record<string, string> = {
    Open: 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-gray-800',
  };

  return (
    <main className="max-w-5xl mx-auto py-8 px-6 text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Dashboard
        </Link>
        <div className="h-6 w-px bg-slate-700"></div>
        <Link
          href="/"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Home
        </Link>
        <div className="h-6 w-px bg-slate-700"></div>
        <Link
          href="/submit"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Submit Ticket
        </Link>
      </div>

      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl text-white mb-2">Ticket #{ticketId}</CardTitle>
              <h2 className="text-xl text-gray-300">Laptop won&apos;t turn on</h2>
            </div>
            <div className="flex gap-3">
              <Badge variant="default" className="bg-orange-500">
                High
              </Badge>
              <Badge className={`${statusColors[status]} border-none text-white`}>
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-700">
            <div>
              <div className="text-sm text-gray-400 mb-1">Submitted By</div>
              <div className="text-white font-medium">John Smith</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Email</div>
              <div className="text-white font-medium">john.smith@company.com</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Category</div>
              <div className="text-white font-medium">Hardware</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Submitted At</div>
              <div className="text-white font-medium">2026-05-04 09:30</div>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-sm text-gray-400 mb-2 block">Description</Label>
            <div className="text-gray-200 bg-slate-700/50 p-4 rounded-lg border border-slate-700">
              My laptop suddenly stopped turning on this morning. I was working on it last night and shut it down normally. When I tried to start it this morning, pressing the power button does nothing - no lights, no sounds, nothing. I&apos;ve tried holding the power button for 30 seconds as suggested online but still no response.
            </div>
          </div>

          <div className="max-w-xs">
            <Label htmlFor="status-select" className="text-sm text-gray-400 mb-2 block">Update Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as any)}
            >
              <SelectTrigger id="status-select" className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Comments & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border ${
                  comment.role === 'admin' ? 'bg-blue-900/30 border-blue-700' : 'bg-slate-700/50 border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    {comment.role === 'admin' && (
                      <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-blue-600">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{comment.timestamp}</span>
                </div>
                <p className="text-gray-200 text-sm">{comment.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm text-gray-400">Add Comment</Label>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note or update for this ticket..."
                rows={4}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 resize-none"
              />
            </div>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Comment
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
