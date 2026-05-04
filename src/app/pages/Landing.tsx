import Link from 'next/link';

export default function Landing() {
  return (
    <main className="max-w-6xl mx-auto text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl mb-6">
          Welcome to <span className="text-green-600">ITFix</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Fast, reliable IT support for your business. Submit a ticket and our expert team will get you back on track in no time.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/submit"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg transition-colors duration-200"
          >
            Submit a Ticket
          </Link>
          <Link
            href="/login"
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-lg text-lg transition-colors duration-200"
          >
            Admin Login
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <h2 className="text-3xl text-center mb-12">How We Help</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800 rounded-lg shadow-md p-8 text-center border border-slate-700">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl mb-3">Fast Response</h3>
            <p className="text-gray-300">
              Our team responds to tickets within minutes, ensuring minimal downtime for your business.
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-8 text-center border border-slate-700">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl mb-3">Expert Support</h3>
            <p className="text-gray-300">
              Certified IT professionals ready to solve hardware, software, and network issues.
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-md p-8 text-center border border-slate-700">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl mb-3">Track Progress</h3>
            <p className="text-gray-300">
              Monitor your ticket status in real-time and stay updated with every step.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="bg-green-600 rounded-lg shadow-lg p-12 text-center text-white">
          <h2 className="text-3xl mb-4">Need Help Right Now?</h2>
          <p className="text-xl mb-8 opacity-90">
            Submit a ticket and our team will assist you immediately
          </p>
          <Link
            href="/submit"
            className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg transition-colors duration-200"
          >
            Get Started →
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl text-green-600 mb-2">24/7</div>
            <div className="text-gray-300">Support Available</div>
          </div>
          <div>
            <div className="text-4xl text-green-600 mb-2">98%</div>
            <div className="text-gray-300">Resolution Rate</div>
          </div>
          <div>
            <div className="text-4xl text-green-600 mb-2">&lt;15min</div>
            <div className="text-gray-300">Avg Response Time</div>
          </div>
          <div>
            <div className="text-4xl text-green-600 mb-2">500+</div>
            <div className="text-gray-300">Companies Served</div>
          </div>
        </div>
      </section>
    </main>
  );
}
