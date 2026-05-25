import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'superadmin') {
      toast.error('Security Alert: Super Admin clearance required.');
      navigate('/');
      return;
    }

    setUser(parsedUser);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    setIsLoading(true);
    try {
      const [statsRes, adminsRes] = await Promise.all([
        fetch('http://localhost:5000/api/superadmin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/superadmin/pending-admins', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!statsRes.ok || !adminsRes.ok) throw new Error('Failed to fetch data');
      
      setStats(await statsRes.json());
      setPendingAdmins(await adminsRes.json());
    } catch (error) {
      toast.error('Could not load system data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAction = async (id, action) => {
    const token = localStorage.getItem('token');
    const endpoint = action === 'approve' 
      ? `http://localhost:5000/api/superadmin/approve-admin/${id}`
      : `http://localhost:5000/api/superadmin/reject-admin/${id}`;
    const method = action === 'approve' ? 'PUT' : 'DELETE';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Failed to ${action} admin`);
      
      toast.success(`Admin successfully ${action}d!`);
      setPendingAdmins(pendingAdmins.filter(admin => admin._id !== id));
      fetchDashboardData(token);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-sm">CC</div>
            <span className="font-bold text-lg tracking-tight text-indigo-900 dark:text-indigo-400">System Overseer</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold hidden sm:block">Super Admin</span>
              <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">SA</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sticky top-24 shadow-sm">
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Global Overview
              </button>
              <button 
                onClick={() => setActiveTab('approvals')}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'approvals' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Admin Approvals
                </div>
                {pendingAdmins.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingAdmins.length}</span>
                )}
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">System Analytics</h2>
                <p className="text-slate-500 dark:text-slate-400">Real-time overview of the entire Campus Connect ecosystem.</p>
              </div>

              {isLoading || !stats ? (
                <div className="p-12 text-center text-slate-500">Loading global statistics...</div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">User Base</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Registered Students</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.users.students}</h3>
                      </div>
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Approved Admins</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">{stats.users.admins}</h3>
                      </div>
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Global Issue Tracker</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Issues Logged</p>
                      <h3 className="text-3xl font-black mt-1">{stats.complaints.total}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Successfully Resolved</p>
                      <h3 className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{stats.complaints.resolved}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Currently Pending</p>
                      <h3 className="text-3xl font-black mt-1 text-rose-600 dark:text-rose-400">{stats.complaints.pending}</h3>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">Pending Access Requests</h2>
                <p className="text-slate-500 dark:text-slate-400">Review and verify personnel requesting Admin privileges.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {isLoading ? (
                  <div className="p-12 text-center text-slate-500">Checking for new requests...</div>
                ) : pendingAdmins.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">You're all caught up!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">There are no pending admin requests to review at this time.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {pendingAdmins.map((admin) => (
                      <div key={admin._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-400 uppercase">
                            {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                          </div>
                          
                          {/* UPDATED: Displays the specific split admin fields */}
                          <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{admin.firstName} {admin.lastName}</h4>
                            <div className="flex flex-col text-sm text-slate-500 gap-1 mt-1">
                              <span>
                                <strong className="text-slate-600 dark:text-slate-400">Assigned To: </strong> 
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                  {admin.stream} {admin.branch} • Semester {admin.semester}
                                </span>
                              </span>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <span><strong className="text-slate-600 dark:text-slate-400">Email:</strong> {admin.email}</span>
                                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                                <span><strong className="text-slate-600 dark:text-slate-400">Contact:</strong> {admin.contactNumber}</span>
                                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                                <span><strong className="text-slate-600 dark:text-slate-400">Emp ID:</strong> {admin.identifier}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button onClick={() => handleAdminAction(admin._id, 'reject')} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-800 rounded-lg text-sm font-bold transition-colors">
                            Reject
                          </button>
                          <button onClick={() => handleAdminAction(admin._id, 'approve')} className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-lg text-sm font-bold transition-colors">
                            Approve Access
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}