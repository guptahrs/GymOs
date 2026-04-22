import { useEffect, useState } from "react";
import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { useNavigate } from "react-router-dom";

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      {/* The dashboard content goes here. The "Tenants" (gyms) list will be on /super-admin/gyms */}
      <div className="text-gray-400">Welcome, Super Admin! Select "Tenants" from the sidebar to manage gyms.</div>
    </SuperAdminLayout>
  );
}
