"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ensureUserRole } from '@/lib/auth/ensure-user-role';
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
  role: 'employee' | 'technician';
  message: string;
  timestamp: string;
};

export default function TicketDetails() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [status, setStatus] = useState<'Open' | 'In Progress' | 'Resolved' | 'Closed'>('Open');
  const [newComment, setNewComment] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const safeTicketId = Array.isArray(ticketId) ? ticketId[0] : ticketId;

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
        fetchTicket();
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
  }, [router, ticketId]);

  const fetchTicket = async () => {
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*, employees(full_name, email)')
      .eq('id', safeTicketId)
      .single();

    if (ticketData) {
      setTicket(ticketData);
      let statusText = 'Open';
      if (ticketData.status === 'taken') statusText = 'In Progress';
      if (ticketData.status === 'closed') statusText = 'Closed';
      setStatus(statusText as any);
    }

    const { data: commentsData } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', safeTicketId)
      .order('created_at', { ascending: true });

    if (commentsData) {
      setComments(commentsData.map(c => ({
        id: c.id,
        author: c.author_role === 'technician' ? 'IT Support' : 'User',
        role: c.author_role as any,
        message: c.message,
        timestamp: new Date(c.created_at).toLocaleString(),
      })));
    }
  };

  const handleStatusChange = async (value: string) => {
    setStatus(value as any);
    const mappedStatus = value === 'Open' ? 'pending' : value === 'In Progress' ? 'taken' : 'closed';
    await supabase.from('tickets').update({ status: mappedStatus }).eq('id', safeTicketId);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUserId) {
      const { data } = await supabase.from('ticket_comments').insert({
        ticket_id: safeTicketId,
        author_id: currentUserId,
        author_role: 'technician',
        message: newComment
      }).select().single();

      if (data) {
        setComments([...comments, {
          id: data.id,
          author: 'IT Support',
          role: 'technician',
          message: data.message,
          timestamp: new Date(data.created_at).toLocaleString(),
        }]);
        setNewComment('');
      }
    }
  };

  const statusColors: Record<string, string> = {
    Open: 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-gray-800',
  };

  if (!isAdmin) return null;
  if (!ticket) return <div className="p-8 text-center text-white">Loading ticket...</div>;

  return (
    <main className="w-full py-8 px-6 md:px-12 lg:px-20 text-foreground bg-background">
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

      <Card className="bg-card border-border mb-6 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl text-foreground mb-2">Ticket #{ticket.short_id || ticket.id.substring(0, 8)}</CardTitle>
              <h2 className="text-xl text-gray-300">{ticket.title}</h2>
            </div>
            <div className="flex gap-3">
              <Badge variant="default" className={ticket.urgency === 'High' || ticket.urgency === 'Critical' ? "bg-orange-500" : ""}>
                {ticket.urgency}
              </Badge>
              <Badge className={`${statusColors[status]} border-none text-white`}>
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-border">
            <div>
              <div className="text-sm text-gray-400 mb-1">Submitted By</div>
              <div className="text-foreground font-medium">{ticket.employees?.full_name || 'Unknown User'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Email</div>
              <div className="text-foreground font-medium">{ticket.employees?.email || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Category</div>
              <div className="text-foreground font-medium">{ticket.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Submitted At</div>
              <div className="text-foreground font-medium">{new Date(ticket.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-sm text-gray-400 mb-2 block">Description</Label>
            <div className="text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          <div className="max-w-xs">
            <Label htmlFor="status-select" className="text-sm text-gray-400 mb-2 block">Update Status</Label>
            <Select
              value={status}
              onValueChange={handleStatusChange}
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

      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Comments & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border ${
                  comment.role === 'technician' ? 'bg-blue-900/30 border-blue-700' : 'bg-slate-700/50 border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    {comment.role === 'technician' && (
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
