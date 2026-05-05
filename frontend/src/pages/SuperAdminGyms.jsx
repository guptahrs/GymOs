import { useEffect, useState } from "react";
import API from "../api/client";
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, User, Crown } from "lucide-react";
import InfoCard from "../components/InfoCard";
import OwnerBadge from "../components/OwnerBadge";

// ── Owner badge with hover card ──

// ── Plan badge ──
function PlanBadge({ gym }) {
  if (!gym.current_plan && gym.subscription_active_status === "No Plan") {
    return (
      <span className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-500 border border-gray-700">
        No Plan
      </span>
    );
  }
  return (
    <span
      className="px-2 py-1 rounded text-xs font-semibold text-white"
      style={{ backgroundColor: gym.current_plan?.badge_color || "#3b82f6" }}
    >
      {gym.current_plan?.name || gym.subscription_active_status}
    </span>
  );
}

export default function SuperAdminGyms() {
  const [gyms, setGyms]               = useState([]);
  const [search, setSearch]           = useState("");
  const [filteredGyms, setFilteredGyms] = useState([]);
  const navigate = useNavigate();

  const { data: gymsData, isLoading } = useQuery(['superadmin_gyms'], async () => {
    const res = await API.get('/gyms/list');
    return res.data.data || [];
  });

  useEffect(() => {
    if (gymsData) { setGyms(gymsData); setFilteredGyms(gymsData); }
  }, [gymsData]);

  useEffect(() => {
    setFilteredGyms(
      gyms.filter((g) =>
        g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, gyms]);

  const getStatusBadge = (gym) => {
    const active = gym.subscription_status;
    if (active) return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">Active</span>;
    return <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700/60 text-gray-400">Inactive</span>;
  };

  return (
    <SuperAdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gyms</h1>
        <button className="btn-primary" onClick={() => navigate("/gyms/add")}>
          + Add Gym
        </button>
      </div>

      <input
        className="input mb-4"
        placeholder="Search gyms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="text-gray-400 py-10 text-center">Loading...</div>
      ) : (
        <div className="bg-card p-6 rounded-2xl shadow-md w-full">
          <table className="w-full table-auto text-sm text-left text-gray-300">
            <thead className="bg-[#0B1220] text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Owner(s)</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGyms.map((gym) => (
                <tr
                  key={gym.gym_id}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-all"
                >
                  {/* Name */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {gym.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">{gym.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-3 text-gray-400">{gym.email}</td>

                  {/* Phone */}
                  <td className="p-3 text-gray-400">{gym.phone}</td>

                  {/* Owners */}
                  <td className="p-3">
                    {gym.owners && gym.owners.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {gym.owners.map((owner) => (
                          <OwnerBadge key={owner.user_id} owner={owner} />
                        ))}
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-500 border border-gray-700">
                        No Owner
                      </span>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="p-3">
                    <PlanBadge gym={gym} />
                  </td>

                  {/* Status */}
                  <td className="p-3">{getStatusBadge(gym)}</td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary/80 transition"
                        onClick={() => navigate(`/gyms/${gym.gym_id}/add-owner`)}
                      >
                        Add Owner
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGyms.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              No gyms found.
            </div>
          )}
        </div>
      )}
    </SuperAdminLayout>
  );
}