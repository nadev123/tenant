"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
  description?: string;
}

export default function TenantDashboard() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.slug as string;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await fetch(`/api/tenants/slug/${tenantSlug}`);
        if (!res.ok) {
          setError("Failed to load tenant");
          // don't navigate back to /dashboard here — middleware will rewrite
          // and this can cause a redirect loop in proxied environments
          return;
        }
        const data = await res.json();
        setTenant(data.tenant);
      } catch (err) {
        console.error("Failed to fetch tenant:", err);
        setError("Failed to load tenant");
      } finally {
        setLoading(false);
      }
    };

    if (tenantSlug) {
      fetchTenant();
    }
  }, [tenantSlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-sm text-gray-600">{tenantSlug}.localhost:3000</p>
          </div>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Tenant ID
            </h3>
            <p className="text-lg font-mono text-gray-900">{tenant.id}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Subdomain
            </h3>
            <p className="text-lg font-mono text-indigo-600">{tenant.slug}</p>
          </div>
          {tenant.customDomain ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                Custom Domain
              </h3>
              <p className="text-lg font-mono text-green-600 mb-3">
                {tenant.customDomain}
              </p>
              <a
                href={`https://${tenant.customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mr-3"
              >
                Visit Custom Domain
              </a>
              <Link
                href={`/tenant/${tenant.slug}/settings`}
                className="inline-block px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
              >
                Manage Domain
              </Link>

              <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                <strong className="block mb-1">DNS setup</strong>
                <div>
                  Add these DNS records at your domain provider:
                  <ul className="list-disc ml-5 mt-1">
                    <li>A record: <span className="font-mono">@</span> → <span className="font-mono">YOUR_SERVER_IP</span></li>
                    <li>CNAME (optional): <span className="font-mono">www</span> → <span className="font-mono">{tenant.customDomain}</span></li>
                  </ul>
                  Wait for DNS propagation (up to 48 hours) and then ensure your server/nginx is configured to accept the custom domain.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
              <Link
                href={`/tenant/${tenant.slug}/settings`}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Add Custom Domain
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
                href={`/tenant/${tenant.slug}/settings`}
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                Tenant Settings
              </h4>
              <p className="text-sm text-gray-600">
                Manage tenant information and custom domains
              </p>
            </Link>
            <Link
              href={`/tenant/${tenant.slug}/members`}
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <h4 className="font-semibold text-gray-900 mb-2">
                Team Members
              </h4>
              <p className="text-sm text-gray-600">
                Invite and manage team members
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
