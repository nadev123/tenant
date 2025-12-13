"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTenant() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Tenant</h1>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600 mb-6">
            Feature to be implemented. For now, create multiple tenants by signing up with different email addresses.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </Link>
        </div>
      </main>
    </div>
  );
}
