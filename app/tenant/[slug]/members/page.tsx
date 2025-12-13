"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TenantMembers() {
  const router = useRouter();
  const params = useParams();
  const tenantSlug = params.slug as string;

  useEffect(() => {
    // Placeholder: If needed, fetch members by tenant id after resolving slug
  }, [tenantSlug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">
            Team members management feature coming soon for tenant: {tenantSlug}
          </p>
        </div>
      </main>
    </div>
  );
}
