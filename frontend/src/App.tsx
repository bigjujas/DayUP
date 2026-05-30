import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import CheckIn from "./pages/CheckIn";
import Profile from "./pages/Profile";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/app" element={<Home />} />
        <Route path="/app/check-in" element={<CheckIn />} />
        <Route path="/app/check-in/:date" element={<CheckIn />} />
        <Route path="/app/metas" element={<Goals />} />
        <Route path="/app/perfil" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
