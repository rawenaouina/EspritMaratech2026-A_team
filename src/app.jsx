import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import DisabilityOnboardingModal from "./components/DisabilityOnboardingModal.jsx";
import DonorChatbot from "./components/DonorChatbot.jsx";

import Home from "./pages/Home.jsx";
import Cases from "./pages/Cases.jsx";
import CaseDetail from "./pages/CaseDetail.jsx";
import Login from "./pages/Login.jsx";
import AssociationNew from "./pages/AssociationNew.jsx";
import AssociationDashboard from "./pages/AssociationDashboard.jsx";
import Admin from "./pages/Admin.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <div className="app-shell min-h-screen flex flex-col">
      {/* A11y */}
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>

      {/* Navbar toujours visible */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* ✅ Onboarding Handicap global */}
      <DisabilityOnboardingModal />

      <main id="main" className="flex-1 min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/association/new" element={<AssociationNew />} />
          <Route path="/association/dashboard" element={<AssociationDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />

          {/* ✅ IMPORTANT */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* ✅ Chatbot global (visible partout) */}
      <div className="fixed bottom-4 right-4 z-[70] w-[360px] max-w-[92vw]">
        <DonorChatbot />
      </div>
    </div>
  );
}
