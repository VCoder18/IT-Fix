"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ensureUserRole } from '@/lib/auth/ensure-user-role';
import type { Tables } from '@/lib/database';
import { Input } from '@/components/ui/input';
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
import { Edit2, Save, X } from 'lucide-react';

type Comment = {
  id: string;
  author: string;
  role: 'user' | 'technician';
  message: string;
  timestamp: string;
};

type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

type TicketRow = Tables<'tickets'> & {
  technicians:
    | Pick<Tables<'technicians'>, 'full_name'>
    | Pick<Tables<'technicians'>, 'full_name'>[]
    | null;
};

function getTechnicianName(relation: TicketRow['technicians']): string {
  if (!relation) return 'Unassigned';
  if (Array.isArray(relation)) return relation[0]?.full_name ?? 'Unassigned';
  return relation.full_name;
}

function toStatusLabel(status: Tables<'tickets'>['status']): TicketStatus {
  if (status === 'taken') return 'In Progress';
  if (status === 'closed') return 'Closed';
  return 'Open';
}

export default function UserTicketDetails() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketRow | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: '',
  });
  const [newComment, setNewComment] = useState('');
  const [isUser, setIsUser] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const safeTicketId = Array.isArray(ticketId) ? ticketId[0] : ticketId;

  useEffect(() => {
    const checkUserAccess = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsUser(false);
        router.replace('/login');
        return;
      }

      try {
        const role = await ensureUserRole(supabase, user);
        if (role !== 'employee') {
          setIsUser(false);
          router.replace('/login');
          return;
        }

        setCurrentUserId(user.id);
        setIsUser(true);
        await fetchTicket();
      } catch (error) {
        const message =
          error instanceof Error
            ? encodeURIComponent(error.message)
            : 'Unable%20to%20resolve%20user%20role';
        setIsUser(false);
        router.replace(`/login?error=${message}`);
      }
    };

    checkUserAccess();
  }, [router, ticketId]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const loadTicketImagePreview = (imagePath: string | null) => {
    if (!imagePath) {
      setImagePreviewUrl(null);
      return;
    }

    const { data } = supabase.storage
      .from('ticket-images')
      .getPublicUrl(imagePath);
    setImagePreviewUrl(data.publicUrl);
  };

  const fetchTicket = async () => {
    if (!safeTicketId) return;

    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*, technicians(full_name)')
      .eq('id', safeTicketId)
      .single();

    if (ticketData) {
      const typedTicket = ticketData as TicketRow;
      setTicket(typedTicket);
      setFormData({
        title: typedTicket.title,
        description: typedTicket.description,
        category: typedTicket.category,
        urgency: typedTicket.urgency,
      });
      setStatus(toStatusLabel(typedTicket.status));
      loadTicketImagePreview(typedTicket.image_url);
    }

    const { data: commentsData } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', safeTicketId)
      .order('created_at', { ascending: true });

    if (commentsData) {
      setComments(commentsData.map(c => ({
        id: c.id,
        author: c.author_role === 'technician' ? 'Technician' : 'You',
        role: c.author_role === 'technician' ? 'technician' : 'user',
        message: c.message,
        timestamp: c.created_at ? new Date(c.created_at).toLocaleString() : '-',
      })));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || !safeTicketId) return;

    setIsPostingComment(true);
    const { data, error } = await supabase.from('ticket_comments').insert({
      ticket_id: safeTicketId,
      author_id: currentUserId,
      author_role: 'employee',
      message: newComment,
    }).select().single();

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Comment failed',
        text: error.message,
      });
      setIsPostingComment(false);
      return;
    }

    if (data) {
      setComments([...comments, {
        id: data.id,
        author: 'You',
        role: 'user',
        message: data.message,
        timestamp: data.created_at ? new Date(data.created_at).toLocaleString() : '-',
      }]);
      setNewComment('');
    }

    setIsPostingComment(false);
  };

  const handleSaveEdit = async () => {
    if (!ticket || !safeTicketId || !currentUserId) return;
    if (!formData.title.trim() || !formData.description.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing required fields',
        text: 'Title and description are required.',
      });
      return;
    }

    setIsSaving(true);

    let nextImagePath = ticket.image_url;
    const previousImagePath = ticket.image_url;

    if (imageFile) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        await Swal.fire({
          icon: 'error',
          title: 'Unsupported image format',
          text: 'Only PNG, JPEG, JPG, and WEBP images are allowed.',
        });
        setIsSaving(false);
        return;
      }

      const maxBytes = 10 * 1024 * 1024;
      if (imageFile.size > maxBytes) {
        await Swal.fire({
          icon: 'error',
          title: 'Image too large',
          text: 'Image must be 10MB or smaller.',
        });
        setIsSaving(false);
        return;
      }

      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
      const safeExt = ['png', 'jpeg', 'jpg', 'webp'].includes(fileExt) ? fileExt : 'png';
      const uploadPath = previousImagePath ?? `${currentUserId}/${Date.now()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('ticket-images')
        .upload(uploadPath, imageFile, {
          upsert: true,
          contentType: imageFile.type,
        });

      if (uploadError) {
        await Swal.fire({
          icon: 'error',
          title: 'Image upload failed',
          text: uploadError.message,
        });
        setIsSaving(false);
        return;
      }

      nextImagePath = uploadPath;
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        urgency: formData.urgency,
        image_url: nextImagePath,
      })
      .eq('id', safeTicketId)
      .select('*, technicians(full_name)')
      .single();

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Ticket update failed',
        text: error.message,
      });
      setIsSaving(false);
      return;
    }

    if (imageFile && previousImagePath && previousImagePath !== nextImagePath) {
      const { error: removeError } = await supabase.storage.from('ticket-images').remove([previousImagePath]);
      if (removeError) {
        await Swal.fire({
          icon: 'warning',
          title: 'Old image cleanup failed',
          text: removeError.message,
        });
      }
    }

    const updatedTicket = data as TicketRow;
    setTicket(updatedTicket);
    setFormData({
      title: updatedTicket.title,
      description: updatedTicket.description,
      category: updatedTicket.category,
      urgency: updatedTicket.urgency,
    });
    setStatus(toStatusLabel(updatedTicket.status));
    setImageFile(null);
    loadTicketImagePreview(updatedTicket.image_url);
    setIsEditing(false);
    setIsSaving(false);

    await Swal.fire({
      icon: 'success',
      title: 'Ticket updated',
    });
  };

  const handleCancelEdit = async () => {
    if (!ticket) return;
    setFormData({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      urgency: ticket.urgency,
    });
    setImageFile(null);
    loadTicketImagePreview(ticket.image_url);
    setIsEditing(false);
  };

  const urgencyVariants: Record<string, "outline" | "default" | "secondary" | "destructive"> = {
    Low: "outline",
    Medium: "secondary",
    High: "default",
    Critical: "destructive",
  };

  if (isUser !== true) return null;
  if (!ticket) return <div className="p-8 text-center text-white">Loading ticket...</div>;
  const statusColors: Record<string, string> = {
    Open: 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-gray-800',
  };

  return (
    <main className="w-full py-8 px-6 md:px-12 lg:px-20 text-foreground bg-background">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/user-dashboard" className="text-green-600 hover:text-green-700 font-medium">
          ← Back to My Tickets
        </Link>
      </div>

      <Card className="bg-card border-border mb-6 shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl text-foreground mb-2">Ticket #{ticket.short_id || ticket.id.substring(0, 8)}</CardTitle>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-border">
            <div>
              <Label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">Assigned To</Label>
              <div className="text-foreground font-medium">{getTechnicianName(ticket.technicians)}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-1 block uppercase tracking-wider">Submitted At</Label>
              <div className="text-foreground font-medium">{new Date(ticket.created_at).toLocaleString()}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Category</Label>
              {!isEditing ? (
                <div className="text-foreground font-medium">{formData.category}</div>
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
                <div className="text-foreground font-medium">{formData.urgency}</div>
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
              <div className="text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border leading-relaxed whitespace-pre-wrap">
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

          <div className="mb-6">
            <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">Image</Label>
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Ticket attachment preview"
                className="max-h-72 rounded-lg border border-border bg-muted/20 object-contain"
              />
            ) : (
              <div className="text-sm text-muted-foreground">No image attached.</div>
            )}
            {isEditing && (
              <div className="mt-3 space-y-2">
                <Input
                  type="file"
                  accept=".png,.jpeg,.jpg,.webp,image/png,image/jpeg,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="bg-slate-700 border-slate-600 text-white file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1.5 file:mr-3"
                />
                <p className="text-xs text-muted-foreground">PNG, JPEG, JPG, or WEBP up to 10MB.</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          )}
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
              disabled={isPostingComment}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPostingComment ? 'Adding...' : 'Add Comment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
