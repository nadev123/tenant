import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">MultiTenant Platform</h1>
          <div className="space-x-4">
            <Link
              href="/signin"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Build Multi-Tenant Platforms
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A complete solution for managing multiple tenants with custom domains
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg font-semibold"
          >
            Start Free
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📦 Subdomains
            </h3>
            <p className="text-gray-600">
              Each tenant gets their own subdomain. Create and manage them easily.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🌐 Custom Domains
            </h3>
            <p className="text-gray-600">
              Connect custom domains to your tenants. Full DNS management support.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              👥 Multi-Tenant
            </h3>
            <p className="text-gray-600">
              One user can manage multiple tenants with full isolation and control.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-6">
            Create your account and launch your first tenant in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Create Account
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 MultiTenant Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
