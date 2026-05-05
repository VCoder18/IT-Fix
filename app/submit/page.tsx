"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { Suspense } from 'react';

const technicians: Record<string, string> = {
  '1': 'Sarah Johnson',
  '2': 'Michael Chen',
  '3': 'Emily Rodriguez',
  '4': 'David Kim',
  '5': 'Jessica Taylor',
  '6': 'Robert Anderson',
};

function SubmitTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const technicianId = searchParams.get('technician');
  const technicianName = technicianId ? technicians[technicianId] : null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    urgency: 'Medium',
    name: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Attempt to save to Supabase
    const { data, error } = await supabase.from('tickets').insert({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      status: 'pending'
    }).select().single();

    if (error) {
      console.error('Error submitting ticket:', error);
      alert('Error submitting ticket. Check console for details.');
      setSubmitted(false);
      return;
    }

    const ticketId = data?.short_id || data?.id.substring(0, 8);
    alert(`Ticket submitted successfully! Your ticket ID is: ${ticketId}`);
    setSubmitted(false);
    setFormData({
      title: '',
      description: '',
      category: 'Hardware',
      urgency: 'Medium',
      name: '',
      email: '',
    });
    router.push('/user-dashboard');
  };

  return (
    <main className="w-full py-8 px-6 md:px-12 lg:px-20 text-foreground bg-background">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      {technicianName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
          <p className="text-blue-700">
            Submitting ticket to: <span className="font-medium text-blue-900">{technicianName}</span>
          </p>
        </div>
      )}

      <p className="text-center text-muted-foreground mb-8">
        Report an issue — we'll get you back on track
      </p>

      <Card className="bg-card border-border mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Submit a Ticket</CardTitle>
          <CardDescription className="text-muted-foreground">Please provide the details of your issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the issue"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happened, any error messages, steps to reproduce..."
                rows={5}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-muted border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Network">Network</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Access & Permissions">Access & Permissions</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger className="bg-muted border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitted}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
            >
              {submitted ? 'Submitting...' : 'Submit Ticket →'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SubmitTicket() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
      <SubmitTicketContent />
    </Suspense>
  );
}
