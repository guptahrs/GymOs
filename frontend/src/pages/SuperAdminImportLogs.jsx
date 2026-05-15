import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileClock, Search } from "lucide-react";

import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

const STATUS_OPTIONS = ["", "queued", "in_progress", "completed", "completed_with_errors", "failed"];
const STATUS_STYLES = {
  queued: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  completed: "bg-green-500/15 text-green-300 border border-green-500/30",
  completed_with_errors: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  failed: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default function SuperAdminImportLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);

  const { data: jobs = [], isLoading } = useQuery(
    ["member_import_jobs", search, statusFilter],
    async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);
      const res = await API.get(`/members/imports/jobs/?${params}`);
      return res.data.data || [];
    },
    { refetchInterval: 4000, keepPreviousData: true }
  );

  const { data: selectedJob } = useQuery(
    ["member_import_job_detail", selectedJobId],
    async () => {
      const res = await API.get(`/members/imports/jobs/${selectedJobId}/`);
      return res.data.data;
    },
    { enabled: Boolean(selectedJobId), refetchInterval: 4000 }
  );

  const summary = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((job) => ["queued", "in_progress"].includes(job.status)).length,
      failed: jobs.filter((job) => ["failed", "completed_with_errors"].includes(job.status)).length,
    }),
    [jobs]
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">File Logger</h1>
          <p className="mt-1 text-sm text-gray-400">
            Review bulk onboarding jobs, processing status, and row-level failures.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Jobs", value: summary.total, icon: FileClock, tone: "text-primary bg-primary/10" },
            { label: "Active", value: summary.active, icon: Search, tone: "text-yellow-300 bg-yellow-500/10" },
            { label: "Needs Review", value: summary.failed, icon: AlertTriangle, tone: "text-red-300 bg-red-500/10" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-800 bg-card p-4">
              <div className={`mb-3 inline-flex rounded-xl p-3 ${card.tone}`}>
                <card.icon size={18} />
              </div>
              <div className="text-2xl font-semibold text-white">{card.value}</div>
              <div className="text-xs uppercase tracking-[0.16em] text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-gray-800 bg-card p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by gym or file name"
                  className="input w-full pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input md:w-56"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.filter(Boolean).map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  <tr>
                    <th className="pb-3">Gym</th>
                    <th className="pb-3">File</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Processed</th>
                    <th className="pb-3">Success</th>
                    <th className="pb-3">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.import_job_id}
                      onClick={() => setSelectedJobId(job.import_job_id)}
                      className={`cursor-pointer border-t border-gray-800 transition hover:bg-white/5 ${
                        selectedJobId === job.import_job_id ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="py-4 text-white">{job.gym_name}</td>
                      <td className="py-4 text-gray-300">{job.original_file_name}</td>
                      <td className="py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[job.status] || "bg-white/10 text-gray-300"}`}>
                          {job.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300">{job.processed_rows}/{job.total_rows}</td>
                      <td className="py-4 text-emerald-300">{job.success_rows}</td>
                      <td className="py-4 text-red-300">{job.failed_rows}</td>
                    </tr>
                  ))}
                  {!isLoading && !jobs.length ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        No import jobs found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-card p-6">
            {!selectedJob ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Select a job to inspect errors and row-level issues.
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedJob.gym_name}</h2>
                  <p className="mt-1 text-sm text-gray-400">{selectedJob.original_file_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#0B1220] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-gray-500">Summary</div>
                    <div className="mt-2 text-sm text-gray-300">{selectedJob.summary_message || "-"}</div>
                  </div>
                  <div className="rounded-2xl bg-[#0B1220] p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-gray-500">Status</div>
                    <div className="mt-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[selectedJob.status] || "bg-white/10 text-gray-300"}`}>
                        {selectedJob.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">Row Errors</h3>
                  {selectedJob.errors?.length ? (
                    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                      {selectedJob.errors.map((error) => (
                        <div key={error.row_error_id} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-white">Row {error.row_number}</div>
                            <div className="text-xs text-gray-400">{error.member_name || error.phone || "Unknown member"}</div>
                          </div>
                          <p className="mt-2 text-sm text-red-200">{error.error_message}</p>
                          <div className="mt-3 rounded-xl bg-black/20 p-3 text-xs text-gray-400">
                            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(error.row_data, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-800 bg-[#0B1220] p-4 text-sm text-gray-500">
                      No row-level issues recorded for this job.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
