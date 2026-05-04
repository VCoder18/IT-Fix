'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SubmitTicket() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    urgency: 'Medium',
    name: '',
    email: '',
  });
  const [trackingId, setTrackingId] = useState('');
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

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/ticket/${trackingId}`);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-8 px-6 text-white">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="text-green-600 hover:text-green-700"
        >
          ← Back to Home
        </Link>
      </div>

      <p className="text-center text-gray-300 mb-8">
        Report an issue — we'll get you back on track
      </p>

      <div className="bg-slate-800 rounded-lg shadow-md p-8 mb-8 border border-slate-700">
        <h2 className="text-2xl mb-6">Submit a Ticket</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-200 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of the issue"
              className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-200 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what happened, any error messages, steps to reproduce..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-200 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option>Hardware</option>
                <option>Software</option>
                <option>Network</option>
                <option>Email</option>
                <option>Access & Permissions</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-200 mb-2">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-200 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-gray-200 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitted}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {submitted ? 'Submitting...' : 'Submit Ticket →'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-md p-8 border border-slate-700">
        <h2 className="text-2xl mb-6">Track an existing ticket</h2>
        <form onSubmit={handleTrack} className="flex gap-3">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Ticket ID (e.g. a1b2c3d4...)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Track
          </button>
        </form>
      </div>
    </main>
  );
}
