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

export default function TenantSettings() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.slug as string;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customDomain: "",
  });

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await fetch(`/api/tenants/slug/${tenantSlug}`);
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        setTenant(data.tenant);
        setFormData({
          name: data.tenant.name,
          description: data.tenant.description || "",
          customDomain: data.tenant.customDomain || "",
        });
      } catch (error) {
        console.error("Failed to fetch tenant:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (tenantSlug) {
      fetchTenant();
    }
  }, [tenantSlug, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (!tenant) {
        setMessage("Tenant not loaded");
        return;
      }

      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      setTenant(data.tenant);
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Link href="/dashboard" className="text-indigo-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tenant Settings</h1>
          <Link
            href={`/tenant/${tenant.slug}/dashboard`}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {message && (
          <div
            className={`mb-4 p-4 rounded ${
              message.startsWith("Error")
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your tenant..."
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Custom Domain
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <input
                  type="text"
                  name="customDomain"
                  value={formData.customDomain}
                  onChange={handleChange}
                  placeholder="example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Point your domains DNS to your server to use a custom domain.
                </p>

                {formData.customDomain && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      DNS Configuration
                    </h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Add this DNS record to your domain provider:
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-300 font-mono text-sm">
                      <p>
                        <span className="text-gray-600">Type:</span> A
                      </p>
                      <p>
                        <span className="text-gray-600">Name:</span> @
                      </p>
                      <p>
                        <span className="text-gray-600">Value:</span>{" "}
                        YOUR_SERVER_IP
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tenant Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Tenant ID</label>
              <p className="text-gray-900 font-mono">{tenant.id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Subdomain</label>
              <p className="text-gray-900">
                {tenant.slug}.localhost:3000
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Custom Domain</label>
              <p className="text-gray-900">
                {tenant.customDomain || "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
