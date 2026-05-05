"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/lib/database';
import { ensureUserRole } from '@/lib/auth/ensure-user-role';
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

type TicketFormValues = Pick<
  TablesInsert<'tickets'>,
  'title' | 'description' | 'category' | 'urgency'
>;

type TechnicianOption = Pick<Tables<'technicians'>, 'id' | 'full_name'>;

function SubmitTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredTechnicianId = searchParams.get('technician');

  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isEmployee, setIsEmployee] = useState<boolean | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<TicketFormValues>({
    title: '',
    description: '',
    category: 'Hardware',
    urgency: 'Medium',
  });

  useEffect(() => {
    const setupPage = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsEmployee(false);
        router.replace('/login');
        return;
      }

      try {
        const role = await ensureUserRole(supabase, user);
        if (role !== 'employee') {
          setIsEmployee(false);
          router.replace('/login');
          return;
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? encodeURIComponent(error.message)
            : 'Unable%20to%20resolve%20user%20role';
        setIsEmployee(false);
        router.replace(`/login?error=${message}`);
        return;
      }

      const { data: techniciansData, error: techniciansError } = await supabase
        .from('technicians')
        .select('id, full_name')
        .order('full_name', { ascending: true });

      if (!techniciansError && techniciansData) {
        const options = techniciansData as TechnicianOption[];
        setTechnicians(options);

        const initialTechnician =
          (preferredTechnicianId && options.some((tech) => tech.id === preferredTechnicianId)
            ? preferredTechnicianId
            : options[0]?.id) ?? null;

        setEmployeeId(user.id);
        setSelectedTechnicianId(initialTechnician);
      } else {
        setEmployeeId(user.id);
      }

      setIsEmployee(true);
    };

    setupPage();
  }, [preferredTechnicianId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !selectedTechnicianId) {
      await Swal.fire({
        icon: 'error',
        title: 'No technician available',
        text: 'No technician is available right now.',
      });
      return;
    }
    if (!imageFile) {
      await Swal.fire({
        icon: 'warning',
        title: 'Image required',
        text: 'Please upload an image.',
      });
      return;
    }

    setSubmitted(true);

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      await Swal.fire({
        icon: 'error',
        title: 'Unsupported image format',
        text: 'Only PNG, JPEG, JPG, and WEBP images are allowed.',
      });
      setSubmitted(false);
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (imageFile.size > maxBytes) {
      await Swal.fire({
        icon: 'error',
        title: 'Image too large',
        text: 'Image must be 10MB or smaller.',
      });
      setSubmitted(false);
      return;
    }

    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'png';
    const safeExt = ['png', 'jpeg', 'jpg', 'webp'].includes(fileExt) ? fileExt : 'png';
    const imagePath = `${employeeId}/${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('ticket-images')
      .upload(imagePath, imageFile, {
        upsert: false,
        contentType: imageFile.type,
      });

    if (uploadError) {
      await Swal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: `Error uploading image: ${uploadError.message}`,
      });
      setSubmitted(false);
      return;
    }

    const payload: Pick<
      TablesInsert<'tickets'>,
      'title' | 'description' | 'category' | 'urgency' | 'image_url' | 'employee_id' | 'technician_id'
    > = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      image_url: imagePath,
      employee_id: employeeId,
      technician_id: selectedTechnicianId,
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert(payload)
      .select()
      .single();

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Ticket submission failed',
        text: `Error submitting ticket: ${error.message}`,
      });
      setSubmitted(false);
      return;
    }

    const ticketId = data?.short_id || data?.id.substring(0, 8);
    await Swal.fire({
      icon: 'success',
      title: 'Ticket submitted',
      text: `Ticket submitted successfully! Your ticket ID is: ${ticketId}`,
    });
    setSubmitted(false);
    setImageFile(null);
    router.push('/user-dashboard');
  };

  if (isEmployee !== true) return null;
  const selectedTechnicianName =
    technicians.find((tech) => tech.id === selectedTechnicianId)?.full_name ?? 'Not selected';

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

      <Card className="bg-card border-border mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Submit a Ticket</CardTitle>
          <CardDescription className="text-muted-foreground">
            Assigned technician: <span className="font-medium text-foreground">{selectedTechnicianName}</span>
          </CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="ticket-image" className="text-foreground">
                Image <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ticket-image"
                type="file"
                required
                accept=".png,.jpeg,.jpg,.webp,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
                className="bg-muted border-border text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1.5 file:mr-3"
              />
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, JPG, or WEBP up to 10MB.
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitted || !employeeId || !selectedTechnicianId || !imageFile}
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
