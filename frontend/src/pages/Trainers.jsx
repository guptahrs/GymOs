import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import DataTable from "../components/DataTable";
import TrainerForm from "../components/TrainerForm";
import { showSnackbar } from "../utils/snackbarService";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data } = useQuery(["trainers"], async () => {
    const res = await API.get('/staff/trainers/');
    return res.data?.data || [];
  });

  useEffect(() => {
    if (data) setTrainers(data);
  }, [data]);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(row) {
    setEditing(row);
    setShowModal(true);
  }

  const deleteMutation = useMutation(async (id) => {
    const res = await API.delete(`/staff/trainers/${id}/`);
    return res.data;
  }, {
    onSuccess: (d) => { showSnackbar(d?.message || 'Trainer deleted', 'success'); queryClient.invalidateQueries(['trainers']); },
    onError: (err) => showSnackbar(err.response?.data?.message || err.message || 'Failed to delete', 'error')
  });

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Shift', accessor: 'shift' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded border border-gray-700 bg-card px-2 py-1">Edit</button>
          <button onClick={() => deleteMutation.mutate(row.trainer_id)} className="rounded bg-red-600 px-2 py-1 text-white">Delete</button>
        </div>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Trainers</h2>
          <button onClick={openCreate} className="rounded-lg bg-primary px-3 py-2 text-black">Add Trainer</button>
        </div>

        <DataTable columns={columns} data={trainers} entity="Trainer" />

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <TrainerForm initialData={editing} onClose={() => { setShowModal(false); queryClient.invalidateQueries(['trainers']); }} onSaved={() => queryClient.invalidateQueries(['trainers'])} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
