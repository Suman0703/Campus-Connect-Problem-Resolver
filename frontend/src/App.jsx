import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AnnouncementsPage from './pages/AnnouncementsPage'; // NEW IMPORT

import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '10px', fontWeight: '600' } }} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* NEW: Solves the 404 Error! */}
        <Route path="/announcements" element={<AnnouncementsPage />} />
        
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
        
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-center">
            <div>
              <h1 className="text-6xl font-black text-red-600 mb-4">404</h1>
              <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
              <a href="/" className="px-6 py-3 bg-red-700 text-white rounded-xl font-bold hover:bg-red-800 transition">Go Back Home</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;