import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddStaff from "./pages/AddStaff";
import AddTrainer from "./pages/AddTrainer";
import Trainers from "./pages/Trainers";
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
import SuperAdminPlans from "./pages/SuperAdminPlans";
import SuperAdminFeatures from "./pages/SuperAdminFeatures";
import SuperAdminSubscriptions from "./pages/SuperAdminSubscriptions";
// Placeholders for forms
import GymAddForm from "./pages/GymAddForm";
import GymOwnerAddForm from "./pages/GymOwnerAddForm";
import Leads from "./pages/Leads";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <AddStaff />
            </ProtectedRoute>
          } />
          <Route path="/staff/add" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <AddStaff />
            </ProtectedRoute>
          } />
          <Route path="/trainer/add" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <AddTrainer />
            </ProtectedRoute>
          } />
          <Route path="/trainer" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <Trainers />
            </ProtectedRoute>
          } />
          <Route path="/plan/add" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <AddPlan />
            </ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <Plans />
            </ProtectedRoute>
          } />
          <Route path="/invoice/create" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <CreateInvoice />
            </ProtectedRoute>
          } />
          <Route path="/payment/record" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <RecordPayment />
            </ProtectedRoute>
          } />
          <Route path="/attendance/view" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <ViewAttendance />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/members" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <Members />
            </ProtectedRoute>
          } />
          <Route path="/members/add" element={
            <ProtectedRoute allowedRoles={["gym_owner"]}>
              <AddMember />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/gyms" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminGyms />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/plans" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminPlans />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/features" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminFeatures />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/subscriptions" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminSubscriptions />
            </ProtectedRoute>
          } />
          <Route path="/gyms/add" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <GymAddForm />
            </ProtectedRoute>
          } />
          <Route path="/gyms/:gymId/add-owner" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <GymOwnerAddForm />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/settings/general" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/settings/account" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/settings/notifications" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  );
}
