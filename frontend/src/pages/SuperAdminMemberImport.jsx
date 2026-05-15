import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, LoaderCircle, Upload, UsersRound } from "lucide-react";

import API from "../api/client";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import { showSnackbar } from "../utils/snackbarService";

const STATUS_STYLES = {
  queued: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  in_progress: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  completed: "bg-green-500/15 text-green-300 border border-green-500/30",
  completed_with_errors: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
  failed: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default function SuperAdminMemberImport() {
  const queryClient = useQueryClient();
  const [selectedGymId, setSelectedGymId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: gyms = [] } = useQuery(["superadmin_gyms_for_import"], async () => {
    const res = await API.get("/gyms/list");
    return res.data.data || [];
  });

  const { data: templateMeta } = useQuery(["member_import_template_meta"], async () => {
    const res = await API.get("/members/imports/template-meta/");
    return res.data.data;
  });

  const { data: recentJobs = [] } = useQuery(
    ["member_import_jobs_recent"],
    async () => {
      const res = await API.get("/members/imports/jobs/");
      return res.data.data || [];
    },
    { refetchInterval: 4000 }
  );

  const uploadMutation = useMutation(
    async () => {
      const formData = new FormData();
      formData.append("gym_id", selectedGymId);
      formData.append("file", selectedFile);
      const res = await API.post("/members/imports/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data?.message || "Import started", "success");
        setSelectedFile(null);
        queryClient.invalidateQueries(["member_import_jobs_recent"]);
      },
    }
  );

  const activeJobs = useMemo(
    () => recentJobs.filter((job) => ["queued", "in_progress"].includes(job.status)).length,
    [recentJobs]
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Bulk Member Onboarding</h1>
            <p className="mt-1 text-sm text-gray-400">
              Upload a member sheet after creating a gym and owner. Processing happens in the background.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-card px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-500">Active Jobs</div>
            <div className="mt-1 text-2xl font-semibold text-white">{activeJobs}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-gray-800 bg-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Upload size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Upload Import File</h2>
                <p className="text-sm text-gray-400">Accepted formats: `.xlsx` and `.csv`</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Select Gym</label>
                <select
                  value={selectedGymId}
                  onChange={(e) => setSelectedGymId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose gym</option>
                  {gyms.map((gym) => (
                    <option key={gym.gym_id} value={gym.gym_id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-2xl border border-dashed border-gray-700 bg-[#0B1220] px-4 py-4 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white"
                />
                {selectedFile ? (
                  <p className="mt-2 text-xs text-gray-500">{selectedFile.name}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => uploadMutation.mutate()}
                disabled={!selectedGymId || !selectedFile || uploadMutation.isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {uploadMutation.isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploadMutation.isLoading ? "Starting import..." : "Upload and Process"}
              </button>

              <a
                href="/member-import-template.csv"
                download
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileSpreadsheet size={16} />
                Download sample file
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Expected File Format</h2>
                <p className="text-sm text-gray-400">Use these columns in the first row.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(templateMeta?.expected_columns || []).map((column) => (
                <span
                  key={column}
                  className={`rounded-full px-3 py-1 text-xs ${
                    (templateMeta?.required_columns || []).includes(column)
                      ? "bg-primary/15 text-primary"
                      : "bg-white/5 text-gray-300"
                  }`}
                >
                  {column}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-400">
              {(templateMeta?.notes || []).map((note) => (
                <div key={note} className="rounded-2xl border border-gray-800 bg-[#0B1220] px-4 py-3">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-300">
              <UsersRound size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Import Jobs</h2>
              <p className="text-sm text-gray-400">Full logs and row errors are available in the File Logger menu.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-gray-500">
                <tr>
                  <th className="pb-3">Gym</th>
                  <th className="pb-3">File</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Summary</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.slice(0, 8).map((job) => (
                  <tr key={job.import_job_id} className="border-t border-gray-800">
                    <td className="py-4 text-white">{job.gym_name}</td>
                    <td className="py-4 text-gray-300">{job.original_file_name}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[job.status] || "bg-white/10 text-gray-300"}`}>
                        {job.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-gray-300">
                      {job.processed_rows}/{job.total_rows}
                    </td>
                    <td className="py-4 text-gray-400">{job.summary_message || "-"}</td>
                  </tr>
                ))}
                {!recentJobs.length ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500">
                      No import jobs yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
