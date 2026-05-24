import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ThemeToggle from '../components/common/ThemeToggle';

export default function HomePage() {
  const navigate = useNavigate();
  
  // State to hold the logged-in user's data
  const [user, setUser] = useState(null);

  // Check local storage for user data when the page loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle Logout Function
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    
    // Show notification and redirect
    toast.success('Logged out successfully.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">

      {/* ===================== NAVBAR ===================== */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-20 px-6 lg:px-10 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0f172a] dark:bg-red-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              CC
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Campus Connect
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rayat Bahra University
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-[15px] font-semibold text-slate-900 dark:text-white">
              Home
            </Link>
            <Link to="/tracker" className="text-[15px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Issue Tracker
            </Link>
            <Link to="/announcements" className="text-[15px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Announcements
            </Link>
          </nav>

          {/* Buttons & Theme Toggle (CONDITIONAL RENDERING) */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              // --- WHAT TO SHOW IF LOGGED IN ---
              <div className="flex items-center gap-4 pl-4 ml-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {user.role}
                  </span>
                </div>
                {/* Dynamic Initial Avatar */}
                <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-bold shadow-sm">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-bold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              // --- WHAT TO SHOW IF LOGGED OUT ---
              <>
                <Link to="/login" className="hidden sm:block text-[15px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-[#991b1b] dark:bg-red-700 hover:bg-[#7f1d1d] dark:hover:bg-red-800 text-white text-sm font-semibold transition-all duration-300 shadow-sm">
                  Get Started
                </Link>
              </>
            )}

          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* LEFT SIDE */}
          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-[#991b1b] dark:text-red-400 text-sm font-semibold mb-8">
              <div className="w-2 h-2 rounded-full bg-[#991b1b] dark:bg-red-500 animate-pulse"></div>
              Smart Campus Management Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0f172a] dark:text-white mb-8">
              Report &
              <br />
              Resolve Campus
              <br />
              <span className="text-[#991b1b] dark:text-red-500">
                Issues Faster
              </span>
            </h1>

            <p className="text-lg leading-9 text-slate-600 dark:text-slate-400 mb-10">
              A modern platform for students and administrators to report,
              manage, and resolve campus complaints with complete transparency
              and real-time updates.
            </p>

            {/* Dynamic Buttons based on Auth State */}
            <div className="flex flex-wrap gap-5">
              {user ? (
                <Link to="/tracker" className="px-8 py-4 rounded-xl bg-[#0f172a] dark:bg-red-700 hover:bg-black dark:hover:bg-red-800 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/login" className="px-8 py-4 rounded-xl bg-[#0f172a] dark:bg-red-700 hover:bg-black dark:hover:bg-red-800 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
                  Report Issue
                </Link>
              )}
              
              <Link to="/tracker" className="px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-white font-semibold transition-all duration-300">
                View Tracker
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE (Overlapping Image) */}
          <div className="relative mt-12 lg:mt-0 w-full">
            <div className="absolute top-0 right-0 w-full md:w-[85%] h-[350px] md:h-[90%] rounded-[32px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="University Campus" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#0f172a]/10 dark:bg-slate-900/30 mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] border border-white/50 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 md:p-10 w-full md:w-[90%] md:-ml-8 mt-40 md:mt-16">
              <div className="flex items-start justify-between mb-10">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">
                    Total Issues Resolved
                  </p>
                  <h2 className="text-5xl md:text-6xl font-black text-[#0f172a] dark:text-white tracking-tight">
                    1,850<span className="text-[#991b1b] dark:text-red-500">+</span>
                  </h2>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#991b1b] dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              </div>

              <div className="space-y-7">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Maintenance Complaints</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">90%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[90%] h-full bg-[#0f172a] dark:bg-white rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Technical Support</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">75%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[75%] h-full bg-[#991b1b] dark:bg-red-500 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Hostel Complaints</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">82%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="w-[82%] h-full bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-4 md:-left-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-6 w-72 z-20 hidden sm:block">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#0f172a] dark:bg-slate-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Live Tracking</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Real-time issue updates</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-7 text-[15px]">
                Students can monitor complaint progress from submission to resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-28 pt-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white mb-5 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-8">
            Built to simplify communication between students, administrators,
            and university departments through one centralized system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-8">
              <svg className="w-8 h-8 text-[#991b1b] dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-5">
              Smart Complaint System
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-8">
              Easily submit and manage complaints related to hostel,
              infrastructure, classrooms, internet, and electricity.
            </p>
          </div>

          <div className="bg-[#0f172a] dark:bg-slate-800 rounded-3xl p-8 text-white shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-5">
              Real-Time Tracking
            </h3>
            <p className="text-slate-300 dark:text-slate-400 leading-8">
              Monitor every issue with live status updates and transparent
              progress tracking from start to resolution.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8">
              <svg className="w-8 h-8 text-[#0f172a] dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-5">
              Announcements
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-8">
              Stay updated with official university notices, maintenance alerts,
              and important announcements instantly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}