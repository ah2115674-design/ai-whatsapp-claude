import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Leads } from './pages/Leads';
import { WhatsApp } from './pages/WhatsApp';
import { Notifications } from './pages/Notifications';
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes — visible to everyone */}
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
          <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />

          <Route path="/auth" element={<Auth />} />

          {/* Protected routes — only logged in users */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/whatsapp" element={<ProtectedRoute><WhatsApp /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}