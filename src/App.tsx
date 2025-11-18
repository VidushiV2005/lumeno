import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import { useEffect } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  // ✅ Use useEffect for navigation
  useEffect(() => {
    if (!user.uid) {
      navigate("/login");
    } else {
      navigate("/dashboard");
    }
  }, [user.uid, navigate]);

  return (
    <Routes>
      {/* ✅ Define all valid routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* 👇 Default route to handle "/" */}
      <Route path="/" element={<Login />} />
    </Routes>
  );
}
