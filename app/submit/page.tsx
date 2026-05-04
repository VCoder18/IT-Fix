"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setSubmitted(true);
    setTimeout(() => {
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
    }, 500);
  };

  return (
    <main className="max-w-4xl mx-auto py-8 px-6 text-white">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      {technicianName && (
        <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
          <p className="text-blue-200">
            Submitting ticket to: <span className="font-medium text-white">{technicianName}</span>
          </p>
        </div>
      )}

      <p className="text-center text-gray-300 mb-8">
        Report an issue — we'll get you back on track
      </p>

      <Card className="bg-slate-800 border-slate-700 mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Submit a Ticket</CardTitle>
          <CardDescription className="text-gray-400">Please provide the details of your issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-200">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the issue"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happened, any error messages, steps to reproduce..."
                rows={5}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-200">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
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
              </div>
              <div className="space-y-2">
                <Label className="text-gray-200">Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
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
                <Label htmlFor="name" className="text-gray-200">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
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
