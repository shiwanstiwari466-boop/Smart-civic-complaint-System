/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import UserDashboard from "./pages/UserDashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ComplaintDetails from "./pages/ComplaintDetails";
import { AuthProvider, useAuth } from "./components/AuthProvider";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Connecting to SmartCivic...</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        
        <Route path="/" element={
          user ? (
            <Layout>
              <UserDashboard />
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/submit" element={
          user ? (
            <Layout>
              <SubmitComplaint />
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/complaint/:id" element={
          user ? (
            <Layout>
              <ComplaintDetails />
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/admin" element={
          user?.role === 'admin' ? (
            <Layout>
              <AdminDashboard />
            </Layout>
          ) : <Navigate to="/" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

