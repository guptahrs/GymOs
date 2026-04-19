import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import { SnackbarProvider } from "./context/SnackbarContext";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";

export default function App() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/add" element={<AddMember />} />
        </Routes>
      </SnackbarProvider>
    </BrowserRouter>
  );
}