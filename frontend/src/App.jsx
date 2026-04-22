import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import AddStaff from "./pages/AddStaff";
import AddTrainer from "./pages/AddTrainer";
import AddPlan from "./pages/AddPlan";
import Plans from "./pages/Plans";
import CreateInvoice from "./pages/CreateInvoice";
import RecordPayment from "./pages/RecordPayment";
import ViewAttendance from "./pages/ViewAttendance";
import { SnackbarProvider } from "./context/SnackbarContext";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminGyms from "./pages/SuperAdminGyms";
// Placeholders for forms
import GymAddForm from "./pages/GymAddForm";
import GymOwnerAddForm from "./pages/GymOwnerAddForm";
import Leads from "./pages/Leads";

export default function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/staff/add" element={
            <ProtectedRoute>
              <AddStaff />
            </ProtectedRoute>
          } />
          <Route path="/trainer/add" element={
            <ProtectedRoute>
              <AddTrainer />
            </ProtectedRoute>
          } />
          <Route path="/plan/add" element={
            <ProtectedRoute>
              <AddPlan />
            </ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          } />
          <Route path="/invoice/create" element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          } />
          <Route path="/payment/record" element={
            <ProtectedRoute>
              <RecordPayment />
            </ProtectedRoute>
          } />
          <Route path="/attendance/view" element={
            <ProtectedRoute>
              <ViewAttendance />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/members" element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          } />
          <Route path="/members/add" element={
            <ProtectedRoute>
              <AddMember />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/gyms" element={
            <ProtectedRoute>
              <SuperAdminGyms />
            </ProtectedRoute>
          } />
          <Route path="/gyms/add" element={
            <ProtectedRoute>
              <GymAddForm />
            </ProtectedRoute>
          } />
          <Route path="/gyms/:gymId/add-owner" element={
            <ProtectedRoute>
              <GymOwnerAddForm />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } />
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  );
}