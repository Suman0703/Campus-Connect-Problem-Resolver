import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ThemeToggle from '../components/common/ThemeToggle';

// Animated counter hook
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    // Trigger hero animation on mount
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Intersection observer for stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const stat1 = useCountUp(98, 1800, statsVisible);
  const stat2 = useCountUp(24, 1400, statsVisible);
  const stat3 = useCountUp(12, 1600, statsVisible);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-300">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(153,27,27,0.35); }
          70%  { box-shadow: 0 0 0 12px rgba(153,27,27,0); }
          100% { box-shadow: 0 0 0 0 rgba(153,27,27,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blobMove {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%       { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }

        .hero-title { animation: ${heroVisible ? 'fadeUp 0.7s ease both' : 'none'}; animation-delay: 0.1s; }
        .hero-badge { animation: ${heroVisible ? 'fadeUp 0.6s ease both' : 'none'}; animation-delay: 0s; }
        .hero-desc  { animation: ${heroVisible ? 'fadeUp 0.7s ease both' : 'none'}; animation-delay: 0.22s; }
        .hero-cta   { animation: ${heroVisible ? 'fadeUp 0.7s ease both' : 'none'}; animation-delay: 0.34s; }
        .hero-right { animation: ${heroVisible ? 'slideRight 0.8s ease both' : 'none'}; animation-delay: 0.18s; }

        .float-card { animation: floatBadge 4s ease-in-out infinite; }
        .float-card-2 { animation: floatBadge 5s ease-in-out infinite 1s; }

        .btn-primary {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
        }
        .dark .btn-primary {
          background: linear-gradient(135deg, #991b1b 0%, #b91c1c 100%);
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #991b1b, #0f172a);
          opacity: 0; transition: opacity 0.3s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(15,23,42,0.25); }
        .dark .btn-primary:hover { box-shadow: 0 12px 32px rgba(153,27,27,0.35); }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-outline {
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          border: 2px solid rgba(15,23,42,0.15);
        }
        .dark .btn-outline { border-color: rgba(255,255,255,0.15); }
        .btn-outline:hover {
          border-color: #991b1b; color: #991b1b;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(153,27,27,0.12);
        }
        .dark .btn-outline:hover { color: #f87171; border-color: #f87171; }

        .feature-card {
          transition: all 0.35s cubic-bezier(.4,0,.2,1);
          position: relative; overflow: hidden;
        }
        .feature-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(153,27,27,0.04), transparent);
          opacity: 0; transition: opacity 0.35s;
        }
        .feature-card:hover { transform: translateY(-6px); }
        .feature-card:hover::after { opacity: 1; }

        .feature-card-dark {
          background: linear-gradient(135deg, #0f172a 0%, #1a2744 100%);
        }
        .dark .feature-card-dark {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        .stat-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stat-card:hover { transform: translateY(-4px) scale(1.02); }

        .nav-link {
          position: relative; transition: color 0.2s;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -4px; left: 0;
          width: 0; height: 2px; background: #991b1b;
          transition: width 0.3s cubic-bezier(.4,0,.2,1);
          border-radius: 2px;
        }
        .nav-link:hover::after { width: 100%; }

        .badge-pulse { animation: pulseRing 2.5s infinite; }

        .hero-image-wrap {
          position: relative;
        }
        .hero-image-wrap::before {
          content: '';
          position: absolute; top: -20px; right: -20px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(153,27,27,0.12) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
          animation: gradientShift 6s ease infinite;
          background-size: 200% 200%;
        }

        .blob {
          position: absolute;
          background: linear-gradient(135deg, rgba(153,27,27,0.07), rgba(15,23,42,0.05));
          filter: blur(40px);
          animation: blobMove 8s ease-in-out infinite;
          pointer-events: none;
        }

        .tag-chip {
          transition: all 0.2s;
        }
        .tag-chip:hover {
          background: rgba(153,27,27,0.12);
          color: #991b1b;
        }

        .progress-bar {
          transition: width 1.2s cubic-bezier(.4,0,.2,1);
        }

        /* Responsive improvements */
        @media (max-width: 640px) {
          .hero-title-size { font-size: clamp(2.2rem, 10vw, 4rem) !important; }
        }
      `}</style>

      {/* ===================== NAVBAR ===================== */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0f172a] dark:bg-red-700 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm font-display transition-transform hover:scale-105">
              CC
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display leading-none">
                Campus Connect
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rayat Bahra Professional University
              </p>
            </div>
            <h1 className="sm:hidden text-lg font-bold text-slate-900 dark:text-white font-display">CC</h1>
          </div>

          {/* Nav Links - desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link text-[15px] font-semibold text-slate-900 dark:text-white">
              Home
            </Link>
            {user && user.role === 'student' && (
              <Link to="/dashboard" className="nav-link text-[15px] font-bold text-[#991b1b] dark:text-red-400">
                My Dashboard
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin-dashboard" className="nav-link text-[15px] font-bold text-[#991b1b] dark:text-red-400">
                Admin Portal
              </Link>
            )}
            {user && user.role === 'superadmin' && (
              <Link to="/super-admin-dashboard" className="nav-link text-[15px] font-bold text-[#991b1b] dark:text-red-400">
                Super Admin Portal
              </Link>
            )}
            <Link to="/announcements" className="nav-link text-[15px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Announcements
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 ml-1 sm:ml-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold shadow-md text-sm uppercase ring-2 ring-red-200 dark:ring-red-900/50">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login" className="hidden sm:block text-[14px] sm:text-[15px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-1">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm">
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-16 lg:pt-24 pb-10 sm:pb-16 lg:pb-20 overflow-hidden">

        {/* Background blobs */}
        <div className="blob w-72 h-72 sm:w-96 sm:h-96 top-0 left-[-100px] opacity-60"></div>
        <div className="blob w-64 h-64 top-20 right-[-80px] opacity-40" style={{animationDelay:'3s'}}></div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">

          {/* LEFT */}
          <div className="max-w-xl z-10">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-[#991b1b] dark:text-red-400 text-sm font-semibold mb-7 sm:mb-8">
              <span className="badge-pulse w-2 h-2 rounded-full bg-[#991b1b] dark:bg-red-500 inline-block flex-shrink-0"></span>
              Smart Campus Management Platform
            </div>

            {/* Title */}
            <h1 className="hero-title hero-title-size font-display text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-[#0f172a] dark:text-white mb-6 sm:mb-8">
              Report &
              <br />
              Resolve Campus
              <br />
              <span className="relative">
                <span className="text-[#991b1b] dark:text-red-500">Issues Faster</span>
                <svg className="absolute -bottom-1 left-0 w-full overflow-visible" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 5 Q50 0 100 4 Q150 8 200 3" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>
                </svg>
              </span>
            </h1>

            <p className="hero-desc text-base sm:text-lg leading-8 sm:leading-9 text-slate-600 dark:text-slate-400 mb-8 sm:mb-10">
              A modern platform for students and administrators to report, manage,
              and resolve campus complaints with complete transparency and real-time updates.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-wrap gap-3 sm:gap-4 mb-10 sm:mb-12">
              {user ? (
                <Link
                  to={user.role === 'superadmin' ? '/super-admin-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md"
                >
                  <span className="flex items-center gap-2">
                    Go to {user.role === 'student' ? 'Dashboard' : 'Portal'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
                  </span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md">
                    <span className="flex items-center gap-2">
                      Report an Issue
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
                    </span>
                  </Link>
                  <Link to="/announcements" className="btn-outline inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base">
                    View Announcements
                  </Link>
                </>
              )}
            </div>

            {/* Trust tags */}
            <div className="hero-cta flex flex-wrap gap-2">
              {['Free to use', 'Real-time updates', 'Secure platform', 'Easy to report'].map((tag) => (
                <span key={tag} className="tag-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs font-medium cursor-default">
                  <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hero-right hero-image-wrap relative mt-8 lg:mt-0 w-full flex-shrink-0">

            {/* Main image card */}
            <div className="relative w-full md:w-[90%] ml-auto rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-300/40 dark:shadow-black/60 group">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="University Campus"
                className="w-full h-[260px] sm:h-[320px] md:h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/40 via-transparent to-transparent"></div>

              {/* Overlay badge on image */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">Campus Support Active</span>
                </div>
                <div className="bg-[#991b1b]/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg">
                  <span className="text-sm font-bold text-white">24/7</span>
                </div>
              </div>
            </div>

            {/* Stats card — replaces fake "1850+ resolved" */}
            <div className="relative z-10 bg-white/97 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] sm:rounded-[28px] border border-slate-200/80 dark:border-slate-700/80 shadow-2xl shadow-slate-200/60 dark:shadow-black/50 p-5 sm:p-7 w-[92%] sm:w-[88%] mx-auto -mt-6 sm:-mt-8 lg:w-[95%] lg:-ml-6 xl:-ml-10 lg:mt-4">

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1">Campus Communication</p>
                  <h2 className="font-display text-lg sm:text-xl font-black text-[#0f172a] dark:text-white leading-snug">
                    Connecting Students &<br />Administration Seamlessly
                  </h2>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-600/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#991b1b] dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                  </svg>
                </div>
              </div>

              {/* Resolution bars */}
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">Maintenance Issues</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Fast Response</span>
                  </div>
                  <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="progress-bar h-full bg-gradient-to-r from-[#0f172a] to-[#334155] dark:from-white dark:to-slate-300 rounded-full" style={{width: statsVisible ? '90%' : '0%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">Technical Support</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Priority Queue</span>
                  </div>
                  <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="progress-bar h-full bg-gradient-to-r from-[#991b1b] to-[#dc2626] rounded-full" style={{width: statsVisible ? '75%' : '0%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">Hostel Complaints</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Tracked Live</span>
                  </div>
                  <div className="w-full h-2.5 sm:h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="progress-bar h-full bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-400 rounded-full" style={{width: statsVisible ? '82%' : '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Float badge */}
            <div className="float-card-2 absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-8 lg:-left-12 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-black/50 p-4 sm:p-5 w-56 sm:w-64 z-20 hidden sm:block">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0f172a] dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0f172a] dark:text-white font-display">Live Tracking</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time updates</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-6">
                Monitor complaints from submission to full resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section ref={statsRef} className="bg-[#0f172a] dark:bg-slate-900 py-10 sm:py-14 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center">
            <div className="stat-card rounded-2xl p-5 sm:p-6 bg-white/5">
              <div className="font-display text-4xl sm:text-5xl font-black text-white mb-2">
                {stat1}<span className="text-[#991b1b]">%</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">Response Rate</p>
            </div>
            <div className="stat-card rounded-2xl p-5 sm:p-6 bg-white/5">
              <div className="font-display text-4xl sm:text-5xl font-black text-white mb-2">
                {stat2}<span className="text-[#991b1b]">/7</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">Campus Assistance</p>
            </div>
            <div className="stat-card rounded-2xl p-5 sm:p-6 bg-white/5">
              <div className="font-display text-4xl sm:text-5xl font-black text-white mb-2">
                {stat3}<span className="text-[#991b1b]">+</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">Departments Connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES SECTION ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-5">
            Why Campus Connect
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white mb-4 sm:mb-5 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-7 sm:leading-8">
            Built to simplify communication between students, administrators, and university departments through one centralized system.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {/* Card 1 */}
          <div className="feature-card bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-600/10 flex items-center justify-center mb-6 sm:mb-8 transition-transform group-hover:scale-110">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#991b1b] dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white mb-3 sm:mb-4">
              Smart Complaint System
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-7">
              Easily submit and manage complaints related to hostel, infrastructure, classrooms, internet, and electricity.
            </p>
            <div className="mt-5 sm:mt-6 flex items-center gap-1.5 text-[#991b1b] dark:text-red-400 text-sm font-semibold group cursor-pointer">
              Learn more
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
            </div>
          </div>

          {/* Card 2 — dark featured */}
          <div className="feature-card feature-card-dark rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#0f172a]/20 dark:shadow-black/40 sm:col-span-2 md:col-span-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 sm:mb-8">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Real-Time Tracking
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-7">
              Monitor every issue with live status updates and transparent progress tracking from start to resolution.
            </p>
            <div className="mt-5 sm:mt-6 flex items-center gap-1.5 text-red-300 text-sm font-semibold group cursor-pointer">
              See how it works
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feature-card bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6 sm:mb-8">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#0f172a] dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white mb-3 sm:mb-4">
              Announcements
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-7">
              Stay updated with official university notices, maintenance alerts, and important announcements instantly.
            </p>
            <div className="mt-5 sm:mt-6 flex items-center gap-1.5 text-[#991b1b] dark:text-red-400 text-sm font-semibold group cursor-pointer">
              View announcements
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA BANNER ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20 lg:pb-28">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0f172a] dark:bg-slate-900 p-8 sm:p-10 lg:p-14 text-white border border-slate-800">
          {/* decorative circles */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#991b1b]/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-[#991b1b]/5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black mb-2 sm:mb-3">
                Ready to get started?
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-7 max-w-lg">
                Join your fellow students and report campus issues instantly. Your voice matters — let's keep the campus running smoothly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {user ? (
                <Link
                  to={user.role === 'superadmin' ? '/super-admin-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-semibold text-sm sm:text-base transition-all hover:-translate-y-1 shadow-lg hover:shadow-red-900/40"
                >
                  Go to {user.role === 'student' ? 'Dashboard' : 'Portal'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-semibold text-sm sm:text-base transition-all hover:-translate-y-1 shadow-lg hover:shadow-red-900/40">
                    Create Account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 12h12"/></svg>
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-semibold text-sm sm:text-base transition-all hover:-translate-y-1">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}