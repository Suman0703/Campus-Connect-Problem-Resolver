import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('issues'); 
  
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // NEW
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin') {
      toast.error('Unauthorized access.');
      navigate('/');
      return;
    }

    setUser(parsedUser);
    fetchAdminData(token);
  }, [navigate]);

  const fetchAdminData = async (token) => {
    setIsLoading(true);
    try {
      const [allRes, assignedRes, annRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/complaints', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/complaints/assigned', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/announcements', { headers: { 'Authorization': `Bearer ${token}` } }) // NEW
      ]);

      if (!allRes.ok || !assignedRes.ok || !annRes.ok) throw new Error('Failed to fetch data');
      
      setComplaints(await allRes.json());
      setAssignedComplaints(await assignedRes.json());
      setAnnouncements(await annRes.json());
    } catch (error) {
      toast.error('Could not load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    const token = localStorage.getItem('token');
    const originalComplaints = [...complaints];
    const originalAssigned = [...assignedComplaints];
    
    setComplaints(complaints.map(c => c._id === complaintId ? { ...c, status: newStatus } : c));
    setAssignedComplaints(assignedComplaints.map(c => c._id === complaintId ? { ...c, status: newStatus } : c));

    try {
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      setComplaints(originalComplaints);
      setAssignedComplaints(originalAssigned);
      toast.error(error.message);
    }
  };

  // NEW: Delete Announcement Handler
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement? The file will be permanently removed.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
      
      toast.success('Announcement deleted successfully!');
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const totalReports = complaints.length;
  const resolvedReports = complaints.filter(c => c.status === 'Resolved').length;
  const pendingReports = complaints.filter(c => c.status === 'Pending').length;
  const inProgressReports = complaints.filter(c => c.status === 'In Progress').length;
  
  // Filter announcements down to ONLY the ones this specific admin posted
  const myAnnouncements = announcements.filter(a => a.admin?._id === user?._id);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm shadow-sm">CC</div>
            <span className="font-bold text-lg tracking-tight">Admin Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold hidden sm:block">{user.firstName} {user.lastName}</span>
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[#0f172a] rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">Admin Assignment</span>
              <h1 className="text-3xl font-black mb-1">Department Administration</h1>
              <p className="text-slate-300 font-medium">
                {user.stream || 'General'} {user.branch || 'Administration'} • Semester {user.semester || 'All'}
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => setActiveTab('issues')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'issues' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                Manage Issues
              </button>
              <button onClick={() => setActiveTab('assigned')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'assigned' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                My Special Reports
                {assignedComplaints.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'assigned' ? 'bg-blue-600 text-white' : 'bg-white text-blue-900'}`}>
                    {assignedComplaints.length}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('announcements')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                Announcements
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'issues' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Issues</p>
                <h3 className="text-3xl font-black">{totalReports}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-b-4 border-b-rose-500">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Pending Action</p>
                <h3 className="text-3xl font-black">{pendingReports}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-b-4 border-b-amber-500">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">In Progress</p>
                <h3 className="text-3xl font-black">{inProgressReports}</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-b-4 border-b-emerald-500">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Resolved</p>
                <h3 className="text-3xl font-black">{resolvedReports}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg">General Department Inbox</h3>
              </div>
              {isLoading ? (
                <div className="p-10 text-center text-slate-500">Loading department issues...</div>
              ) : complaints.length === 0 ? (
                <div className="p-10 text-center text-slate-500 font-medium">No issues reported in your department yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">Student Info</th>
                        <th className="px-6 py-4 font-bold">Issue Details</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {complaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'Unknown'}
                            </div>
                            <div className="text-xs text-slate-500">Roll: {complaint.student?.identifier || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4 items-start">
                              {complaint.image && (
                                <a href={`http://localhost:5000${complaint.image}`} target="_blank" rel="noreferrer" className="shrink-0">
                                  <img src={`http://localhost:5000${complaint.image}`} alt="Evidence" className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                                </a>
                              )}
                              <div className="max-w-xs">
                                <div className="font-bold mb-1 truncate">{complaint.title}</div>
                                <div className="text-[10px] text-slate-400">{formatDate(complaint.createdAt)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold">{complaint.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={complaint.status}
                              onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                              className={`text-xs font-bold rounded-full px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(complaint.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
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

        {activeTab === 'assigned' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-indigo-100 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-400">Directly Assigned To You</h3>
              </div>
              {isLoading ? (
                <div className="p-10 text-center text-slate-500">Loading your assignments...</div>
              ) : assignedComplaints.length === 0 ? (
                <div className="p-16 text-center text-slate-500">You have no directly assigned reports right now.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 border-b border-indigo-100 dark:border-indigo-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">Student Info</th>
                        <th className="px-6 py-4 font-bold">Issue Details</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50 dark:divide-indigo-900/30">
                      {assignedComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-white dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold">{complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'Unknown'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-indigo-800 dark:text-indigo-400 truncate">{complaint.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold">{complaint.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={complaint.status}
                              onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                              className={`text-xs font-bold rounded-full px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(complaint.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
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

        {/* TAB 3: ANNOUNCEMENTS MANAGEMENT */}
        {activeTab === 'announcements' && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-12">
            
            {/* Post Announcement Form */}
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-black tracking-tight mb-2">Broadcast Announcement</h2>
                <p className="text-slate-500 dark:text-slate-400">Publish important notices to your department students.</p>
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
                    if (!res.ok) throw new Error('Failed to post announcement');
                    
                    const newAnnouncement = await res.json();
                    setAnnouncements([newAnnouncement, ...announcements]); // Add to UI immediately
                    
                    toast.success('Announcement broadcasted successfully!');
                    e.target.reset();
                    document.getElementById('file-name-display').textContent = '';
                  } catch (err) { toast.error(err.message); } finally { setIsLoading(false); }
                }} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-2">Notice Title</label>
                      <input type="text" name="title" required className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Priority Level</label>
                      <select name="priority" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 font-bold appearance-none">
                        <option value="Normal">Normal</option>
                        <option value="High" className="text-amber-600">High Priority</option>
                        <option value="Emergency" className="text-rose-600">🚨 Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Message Content</label>
                    <textarea name="content" required rows="4" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 font-medium resize-none"></textarea>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed text-center">
                    <input type="file" name="attachment" id="attachment" className="hidden" onChange={(e) => {
                        const name = e.target.files[0]?.name || '';
                        document.getElementById('file-name-display').textContent = name ? `Attached: ${name}` : '';
                      }} />
                    <label htmlFor="attachment" className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full font-bold text-sm hover:shadow-md transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      Attach Document
                    </label>
                    <p id="file-name-display" className="mt-3 text-sm font-bold text-blue-600 dark:text-blue-400"></p>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50">
                    Publish Announcement
                  </button>
                </form>
              </div>
            </div>

            {/* Announcement History / Management List */}
            <div>
              <h3 className="text-2xl font-black mb-4">Your Broadcast History</h3>
              {myAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  You haven't posted any announcements yet.
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-bold">Notice Title</th>
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

      </main>
    </div>
  );
}