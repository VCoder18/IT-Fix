"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star } from 'lucide-react';

type Technician = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialization: string;
  proficiencies: string[];
  rating: number;
  availability: 'Available' | 'Busy' | 'Offline';
  bio: string;
};

const mockTechnicians: Technician[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@itfix.com',
    avatar: 'SJ',
    specialization: 'Hardware Specialist',
    proficiencies: ['Hardware', 'Laptop Repair', 'Desktop Issues', 'Printer Problems'],
    rating: 4.8,
    availability: 'Available',
    bio: 'Hardware specialist with 8+ years of experience in diagnosing and repairing computer hardware issues. Expert in laptop and desktop troubleshooting.',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@itfix.com',
    avatar: 'MC',
    specialization: 'Network Engineer',
    proficiencies: ['Network', 'VPN Issues', 'WiFi Problems', 'Connection Errors'],
    rating: 4.9,
    availability: 'Available',
    bio: 'Certified network engineer specializing in corporate network infrastructure, VPN configurations, and connectivity troubleshooting.',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@itfix.com',
    avatar: 'ER',
    specialization: 'Software Expert',
    proficiencies: ['Software', 'Application Crashes', 'Installation', 'Bug Fixes'],
    rating: 4.7,
    availability: 'Busy',
    bio: 'Software troubleshooting expert with deep knowledge of Windows, macOS, and Linux systems. Specializes in application debugging and software optimization.',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@itfix.com',
    avatar: 'DK',
    specialization: 'Security Specialist',
    proficiencies: ['Access & Permissions', 'Data Corruption', 'Security Issues', 'Malware'],
    rating: 4.9,
    availability: 'Available',
    bio: 'Cybersecurity professional focused on access control, data protection, and malware removal. Certified in multiple security frameworks.',
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@itfix.com',
    avatar: 'JT',
    specialization: 'Email & Communication',
    proficiencies: ['Email', 'Outlook Issues', 'Calendar Sync', 'Communication Tools'],
    rating: 4.6,
    availability: 'Offline',
    bio: 'Email systems specialist with expertise in Microsoft 365, Outlook, and enterprise communication platforms.',
  },
  {
    id: '6',
    name: 'Robert Anderson',
    email: 'robert.anderson@itfix.com',
    avatar: 'RA',
    specialization: 'Full Stack Support',
    proficiencies: ['Hardware', 'Software', 'Network', 'Email'],
    rating: 4.8,
    availability: 'Available',
    bio: 'Versatile IT professional with comprehensive knowledge across hardware, software, and networking. Your go-to expert for complex multi-domain issues.',
  },
];

export default function Technicians() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('All');

  const allProficiencies = Array.from(
    new Set(mockTechnicians.flatMap(tech => tech.proficiencies))
  );

  const filteredTechnicians = mockTechnicians.filter(tech => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.proficiencies.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProficiency =
      selectedProficiency === 'All' ||
      tech.proficiencies.includes(selectedProficiency);

    return matchesSearch && matchesProficiency;
  });

  const availabilityColors: Record<string, string> = {
    Available: 'bg-green-500',
    Busy: 'bg-yellow-500',
    Offline: 'bg-gray-500',
  };

  return (
    <main className="max-w-7xl mx-auto py-8 px-6 text-white">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
          ← Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Browse Technicians</h1>

      <Card className="bg-slate-800 border-slate-700 mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialization, or skill..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Filter by Proficiency</label>
              <Select
                value={selectedProficiency}
                onValueChange={setSelectedProficiency}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="All">All Proficiencies</SelectItem>
                  {allProficiencies.map(prof => (
                    <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map(tech => (
          <Card key={tech.id} className="bg-slate-800 border-slate-700 flex flex-col h-full hover:border-green-600/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {tech.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{tech.name}</CardTitle>
                    <CardDescription className="text-gray-400">{tech.specialization}</CardDescription>
                  </div>
                </div>
                <Badge className={`${availabilityColors[tech.availability]} border-none text-white`}>
                  {tech.availability}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center gap-1 text-yellow-500 font-medium">
                <Star className="w-4 h-4 fill-current" />
                <span>{tech.rating}/5.0</span>
              </div>

              <p className="text-sm text-gray-300 line-clamp-3 italic">
                &ldquo;{tech.bio}&rdquo;
              </p>

              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Proficiencies</p>
                <div className="flex flex-wrap gap-1">
                  {tech.proficiencies.map(prof => (
                    <Badge
                      key={prof}
                      variant="secondary"
                      className="bg-slate-700 text-gray-300 text-[10px] py-0 px-2"
                    >
                      {prof}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                asChild
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href={`/submit?technician=${tech.id}`}>
                  Submit Ticket to {tech.name.split(' ')[0]}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
          No technicians found matching your criteria.
        </div>
      )}
    </main>
  );
}
