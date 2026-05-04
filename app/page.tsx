import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <main className="max-w-6xl mx-auto text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl mb-6 font-bold">
          Welcome to <span className="text-green-600">ITFix</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Fast, reliable IT support for your business. Submit a ticket and our expert team will get you back on track in no time.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 text-lg">
            <Link href="/submit">
              Submit a Ticket
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 text-lg border-none">
            <Link href="/technicians">
              Browse Technicians
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-slate-800 hover:bg-slate-700 text-white h-14 px-8 text-lg border-slate-700">
            <Link href="/login">
              Portal Login
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <h2 className="text-3xl text-center mb-12 font-semibold">How We Help</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800 rounded-xl shadow-lg p-8 text-center border border-slate-700 transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Fast Response</h3>
            <p className="text-gray-300 leading-relaxed">
              Our team responds to tickets within minutes, ensuring minimal downtime for your business.
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-8 text-center border border-slate-700 transition-transform hover:scale-[1.02]">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
            <p className="text-gray-300 leading-relaxed">
              Certified IT professionals ready to solve hardware, software, and network issues.
            </p>
          </div>


        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="bg-green-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Need Help Right Now?</h2>
          <p className="text-xl mb-8 opacity-90">
            Submit a ticket and our team will assist you immediately
          </p>
          <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 h-14 px-10 text-lg border-none shadow-xl">
            <Link href="/submit">
              Get Started Now →
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-400 font-medium">Support Available</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-400 font-medium">Resolution Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">&lt;15min</div>
            <div className="text-gray-400 font-medium">Avg Response Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-400 font-medium">Companies Served</div>
          </div>
        </div>
      </section>
    </main>
  );
}
