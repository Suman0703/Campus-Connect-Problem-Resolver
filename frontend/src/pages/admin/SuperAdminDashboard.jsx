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
  const [announcements, setAnnouncements] = useState([]);
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
      const [statsRes, adminsRes, annRes] = await Promise.all([
        fetch('http://localhost:5000/api/superadmin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/superadmin/pending-admins', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/announcements', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!statsRes.ok || !adminsRes.ok || !annRes.ok) throw new Error('Failed to fetch data');
      
      setStats(await statsRes.json());
      setPendingAdmins(await adminsRes.json());
      setAnnouncements(await annRes.json());
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

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this directive?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete directive');
      
      toast.success('Directive deleted successfully!');
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const myAnnouncements = announcements.filter(a => a.admin?._id === user?._id);

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
              <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Global Overview
              </button>
              
              <button onClick={() => setActiveTab('approvals')} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'approvals' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Admin Approvals
                </div>
                {pendingAdmins.length > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingAdmins.length}</span>}
              </button>

              <button onClick={() => setActiveTab('announcements')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'announcements' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24M11 5.882a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m-3 6a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m6 9a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0" /></svg>
                Post Directive
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">System Analytics</h2>
              </div>
              {isLoading || !stats ? (
                <div className="p-12 text-center text-slate-500">Loading global statistics...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Registered Students</p>
                        <h3 className="text-4xl font-black">{stats.users.students}</h3>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Approved Admins</p>
                        <h3 className="text-4xl font-black">{stats.users.admins}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">Total Issues</p>
                      <h3 className="text-3xl font-black mt-1">{stats.complaints.total}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">Resolved</p>
                      <h3 className="text-3xl font-black mt-1 text-emerald-600">{stats.complaints.resolved}</h3>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm font-semibold text-slate-500">Pending</p>
                      <h3 className="text-3xl font-black mt-1 text-rose-600">{stats.complaints.pending}</h3>
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
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {isLoading ? (
                  <div className="p-12 text-center text-slate-500">Checking for new requests...</div>
                ) : pendingAdmins.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">There are no pending admin requests to review at this time.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {pendingAdmins.map((admin) => (
                      <div key={admin._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold">{admin.firstName} {admin.lastName}</h4>
                            <div className="flex flex-col text-sm text-slate-500 gap-1 mt-1">
                              <span><strong className="text-slate-600">Assigned To: </strong> <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{admin.stream} {admin.branch} • Sem {admin.semester}</span></span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleAdminAction(admin._id, 'reject')} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-sm font-bold">Reject</button>
                          <button onClick={() => handleAdminAction(admin._id, 'approve')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold">Approve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: POST DIRECTIVE & MANAGEMENT */}
          {activeTab === 'announcements' && (
            <div className="animate-in fade-in duration-500 max-w-4xl space-y-12">
              
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-black tracking-tight mb-2">Broadcast Directive</h2>
                  <p className="text-slate-500 dark:text-slate-400">Push official notices and procedural documents exclusively to the Administrator tier.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    const token = localStorage.getItem('token');
                    const form = new FormData(e.target);

                    try {
                      const res = await fetch('http://localhost:5000/api/announcements', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: form
                      });
                      if (!res.ok) throw new Error('Failed to post directive');
                      
                      const newDirective = await res.json();
                      setAnnouncements([newDirective, ...announcements]);
                      
                      toast.success('Directive broadcasted successfully!');
                      e.target.reset();
                      document.getElementById('file-name-display').textContent = '';
                    } catch (err) { toast.error(err.message); } finally { setIsLoading(false); }
                  }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold mb-2">Directive Title</label>
                        <input type="text" name="title" required className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Priority</label>
                        <select name="priority" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 appearance-none font-bold">
                          <option value="Normal">Normal</option>
                          <option value="High" className="text-amber-600">High Priority</option>
                          <option value="Emergency" className="text-rose-600">🚨 Emergency</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Message</label>
                      <textarea name="content" required rows="4" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 resize-none font-medium"></textarea>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed text-center">
                      <input type="file" name="attachment" id="attachment" className="hidden" onChange={(e) => {
                          const name = e.target.files[0]?.name || '';
                          document.getElementById('file-name-display').textContent = name ? `Attached: ${name}` : '';
                        }} />
                      <label htmlFor="attachment" className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-full font-bold text-sm text-slate-700 hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        Attach Document
                      </label>
                      <p id="file-name-display" className="mt-3 text-sm font-bold text-indigo-600 dark:text-indigo-400"></p>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50">
                      Issue Directive
                    </button>
                  </form>
                </div>
              </div>

              {/* Directive History / Management List */}
              <div>
                <h3 className="text-2xl font-black mb-4">Your Broadcast History</h3>
                {myAnnouncements.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    You haven't posted any directives yet.
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-bold">Directive Title</th>
                          <th className="px-6 py-4 font-bold">Priority</th>
                          <th className="px-6 py-4 font-bold">Posted Date</th>
                          <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {myAnnouncements.map(notice => (
                          <tr key={notice._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="px-6 py-4 font-bold truncate max-w-[200px]">{notice.title}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${notice.priority === 'Emergency' ? 'bg-rose-100 text-rose-700' : notice.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                {notice.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(notice.createdAt)}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleDeleteAnnouncement(notice._id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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