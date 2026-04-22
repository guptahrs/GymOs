import { useEffect, useState } from "react";
import API from "../api/client";
import { useQuery } from '@tanstack/react-query';
import MainLayout from "../layouts/MainLayout";
import BackButton from "../components/BackButton";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const { data: membersData, isLoading } = useQuery([
    'members', { search, page }
  ], async () => {
    const res = await API.get(`/members/?search=${search}&page=${page}`);
    return res.data.data;
  }, { keepPreviousData: true });

  useEffect(() => {
    if (membersData) {
      setMembers(membersData.results || []);
      setCount(membersData.count || 0);
    }
  }, [membersData]);

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Status", accessor: "status" },
  ];

  return (
    <MainLayout>
      <div className="w-full">{/* 🔍 Search */}
        <div className="flex items-center gap-3 mb-6">
          {/* <BackButton />
          <h1 className="text-2xl font-semibold tracking-tight leading-none">
            Members
          </h1> */}
        </div>
        <div className="flex items-center justify-between mb-6">

          {/* LEFT */}
          <div className="flex items-center gap-3 w-full">

            {/* Search */}
            <input
              type="text"
              placeholder="Search members..."
              className="px-4 py-2 w-80 rounded-lg bg-card border border-gray-700 text-white outline-none focus:ring-1 focus:ring-primary"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            <button className="px-3 py-2 bg-card border border-gray-700 rounded-lg hover:bg-white/5">
              Filter
            </button>

            <button className="px-3 py-2 bg-card border border-gray-700 rounded-lg hover:bg-white/5">
              Sort
            </button>

            <button className="px-3 py-2 bg-card border border-gray-700 rounded-lg hover:bg-white/5">
              View
            </button>

          </div>

        </div>
        {/* Table */}
        <DataTable columns={columns} data={members} />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">

          <button
            className="px-4 py-2 bg-card border border-gray-700 rounded-lg hover:bg-white/5 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className="text-gray-400 text-sm">
            Page {page}
          </span>

          <button
            className="px-4 py-2 bg-card border border-gray-700 rounded-lg hover:bg-white/5"
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>

        </div>
      </div>
    </MainLayout>
  );
}