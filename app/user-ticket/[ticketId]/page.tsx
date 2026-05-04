"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Edit2, Save, X } from 'lucide-react';

type Comment = {
  id: string;
  author: string;
  role: 'user' | 'technician';
  message: string;
  timestamp: string;
};

export default function UserTicketDetails() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: 'Laptop won\'t turn on',
    description: 'My laptop suddenly stopped turning on this morning. I was working on it last night and shut it down normally. When I tried to start it this morning, pressing the power button does nothing - no lights, no sounds, nothing.',
    category: 'Hardware',
    urgency: 'High',
  });
  const [newComment, setNewComment] = useState('');
  const [isUser, setIsUser] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'You',
      role: 'user',
      message: 'My laptop suddenly stopped turning on this morning. I tried holding the power button but nothing happens.',
      timestamp: '2026-05-04 09:30',
    },
    {
      id: '2',
      author: 'Sarah Johnson',
      role: 'technician',
      message: 'Thanks for reporting this. Can you check if the charging light is on when you plug in the charger?',
      timestamp: '2026-05-04 09:45',
    },
    {
      id: '3',
      author: 'You',
      role: 'user',
      message: 'Yes, the charging light is on. It shows orange indicating it\'s charging.',
      timestamp: '2026-05-04 10:00',
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userAuth = localStorage.getItem('isUser');
    if (!userAuth) {
      router.push('/login');
    } else {
      setIsUser(true);
    }
  }, [router]);

  if (!isUser) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: 'You',
          role: 'user',
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

  const handleSaveEdit = () => {
    setIsEditing(false);
    // In a real app, this would be an API call
  };

  const urgencyVariants: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
    Low: "outline",
    Medium: "secondary",
    High: "default",
    Critical: "destructive",
  };

  const status = 'In Progress';
  const statusColors: Record<string, string> = {
    Open: 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-gray-800',
  };

  return (
    <main className="max-w-5xl mx-auto py-8 px-6 text-white">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/user-dashboard" className="text-green-600 hover:text-green-700 font-medium">
          ← Back to My Tickets
        </Link>
      </div>

      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl text-white mb-2">Ticket #{ticketId}</CardTitle>
              {!isEditing ? (
                <h2 className="text-xl text-gray-300 font-medium">{formData.title}</h2>
              ) : (
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-xl bg-slate-700 border-slate-600 text-white"
                />
              )}
            </div>
            <div className="flex gap-3 items-center">
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              )}
              <Badge variant={urgencyVariants[formData.urgency]}>
                {formData.urgency}
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
              <Label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">Assigned To</Label>
              <div className="text-white font-medium">Sarah Johnson</div>
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">Submitted At</Label>
              <div className="text-white font-medium">2026-05-04 09:30</div>
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Category</Label>
              {!isEditing ? (
                <div className="text-white font-medium">{formData.category}</div>
              ) : (
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Access & Permissions">Access & Permissions</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Urgency</Label>
              {!isEditing ? (
                <div className="text-white font-medium">{formData.urgency}</div>
              ) : (
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Description</Label>
            {!isEditing ? (
              <div className="text-gray-200 bg-slate-700/50 p-4 rounded-lg border border-slate-700 leading-relaxed">
                {formData.description}
              </div>
            ) : (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full bg-slate-700 border-slate-600 text-white resize-none"
              />
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <Button
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          )}
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
                  comment.role === 'technician' ? 'bg-blue-900/30 border-blue-700' : 'bg-slate-700/50 border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{comment.author}</span>
                    {comment.role === 'technician' && (
                      <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-blue-600">
                        Technician
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{comment.timestamp}</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{comment.message}</p>
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
                placeholder="Add a comment or provide more information..."
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
