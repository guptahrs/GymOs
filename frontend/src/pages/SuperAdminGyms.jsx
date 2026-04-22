import { useEffect, useState } from "react";
import API from "../api/client";
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { useNavigate } from "react-router-dom";

export default function SuperAdminGyms() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredGyms, setFilteredGyms] = useState([]);
  const navigate = useNavigate();

  const { data: gymsData, isLoading } = useQuery(['superadmin_gyms'], async () => {
    const res = await API.get('/gyms/list');
    return res.data.data || [];
  });

  useEffect(() => {
    if (gymsData) {
      setGyms(gymsData);
      setFilteredGyms(gymsData);
      setLoading(false);
    }
  }, [gymsData]);

  useEffect(() => {
    setFilteredGyms(
      gyms.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, gyms]);

  // Helper for status badge (dummy logic, update as per real status field if available)
  const getStatusBadge = (status) => {
    let color = "bg-gray-700 text-gray-300";
    let label = status || "Unknown";
    if (status === "Active") color = "bg-green-500/20 text-green-400";
    else if (status === "Pending") color = "bg-yellow-500/20 text-yellow-400";
    else if (status === "Inactive") color = "bg-red-500/20 text-red-400";
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{label}</span>;
  };

  return (
    <SuperAdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gyms</h1>
        <button
          className="btn-primary"
          onClick={() => navigate("/gyms/add")}
        >
          + Add Gym
        </button>
      </div>
      <input
        className="input mb-4"
        placeholder="Search gyms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-card p-6 rounded-2xl shadow-md w-full">
          <table className="w-full table-auto text-sm text-left text-gray-300">
            <thead className="bg-[#0B1220] text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Owner</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGyms.map((gym) => (
                <tr key={gym.gym_id} className="border-b border-gray-700 hover:bg-gray-800/40 transition-all">
                  <td className="p-2 font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                      {gym.name?.split(" ").map(w => w[0]).join("").slice(0,2)}
                    </div>
                    <span>{gym.name}</span>
                  </td>
                  <td className="p-2">{gym.email}</td>
                  <td className="p-2">{gym.phone}</td>
                  <td className="p-2">
                    {gym.owner_id ? (
                      <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 font-semibold">Owner Assigned</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">No Owner</span>
                    )}
                  </td>
                  <td className="p-2">
                    {/* Dummy status, replace with real status if available */}
                    {getStatusBadge(gym.status || "Active")}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="bg-primary text-white px-3 py-1 rounded text-xs shadow hover:bg-primary/80 transition"
                      onClick={() => navigate(`/gyms/${gym.gym_id}/add-owner`)}
                    >
                      Add Owner
                    </button>
                    {/* More actions can go here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SuperAdminLayout>
  );
}
