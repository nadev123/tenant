"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/signin");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setTenants(data.tenants);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">MultiTenant Platform</h1>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/signin");
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="text-gray-900 font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <Link
                href="/settings/profile"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Create New Tenant Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Tenant
            </h3>
            <p className="text-gray-600 mb-4">
              Add another workspace or organization to your account.
            </p>
            <Link
              href="/tenant/create"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Create Tenant
            </Link>
          </div>
        </div>

        {/* Tenants List */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Tenants</h3>
          {tenants.length === 0 ? (
            <p className="text-gray-600">No tenants found. Create one to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {tenant.name}
                    </h4>
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Subdomain</p>
                        <p className="text-sm font-mono text-indigo-600">
                          {tenant.slug}.localhost:3000
                        </p>
                      </div>
                      {tenant.customDomain && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Custom Domain</p>
                          <p className="text-sm font-mono text-green-600">
                            {tenant.customDomain}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {tenant.customDomain ? (
                        <a
                          href={`https://${tenant.customDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                        >
                          Visit Custom Domain
                        </a>
                      ) : (
                        <Link
                          href={`/tenant/${tenant.slug}/dashboard`}
                          className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                        >
                          View Tenant
                        </Link>
                      )}

                      <Link
                        href={`/tenant/${tenant.slug}/settings`}
                        className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition text-sm"
                      >
                        Settings
                      </Link>

                      {tenant.customDomain && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                          <strong className="block mb-1">DNS setup</strong>
                          <div className="text-xs">
                            Add a DNS record for <span className="font-mono">{tenant.customDomain}</span>:
                            <ul className="list-disc ml-5 mt-1">
                              <li>
                                A record: <span className="font-mono">@</span> → <span className="font-mono">YOUR_SERVER_IP</span>
                              </li>
                              <li>
                                (Optional) CNAME: <span className="font-mono">www</span> → <span className="font-mono">{tenant.customDomain}</span>
                              </li>
                            </ul>
                            After DNS propagation, the custom domain will serve your tenant dashboard.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
