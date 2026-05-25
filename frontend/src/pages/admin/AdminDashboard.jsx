import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'assigned', or 'announcements'
  
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]); // NEW STATE
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    // Extra security check on the frontend
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin') {
      toast.error('Unauthorized access.');
      navigate('/');
      return;
    }

    setUser(parsedUser);
    fetchAllComplaints(token);
  }, [navigate]);

  const fetchAllComplaints = async (token) => {
    setIsLoading(true);
    try {
      // Fetch BOTH general issues and specifically assigned issues
      const [allRes, assignedRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/complaints', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/complaints/assigned', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!allRes.ok || !assignedRes.ok) throw new Error('Failed to fetch complaints');
      
      setComplaints(await allRes.json());
      setAssignedComplaints(await assignedRes.json());
    } catch (error) {
      toast.error('Could not load reports. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    const token = localStorage.getItem('token');
    
    // Optimistic UI Update for BOTH lists simultaneously
    const originalComplaints = [...complaints];
    const originalAssigned = [...assignedComplaints];
    
    setComplaints(complaints.map(c => c._id === complaintId ? { ...c, status: newStatus } : c));
    setAssignedComplaints(assignedComplaints.map(c => c._id === complaintId ? { ...c, status: newStatus } : c));

    try {
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Status updated to ${newStatus}`);
      
    } catch (error) {
      // Revert if it fails
      setComplaints(originalComplaints);
      setAssignedComplaints(originalAssigned);
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
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Stats (Using general inbox for overall stats)
  const totalReports = complaints.length;
  const resolvedReports = complaints.filter(c => c.status === 'Resolved').length;
  const pendingReports = complaints.filter(c => c.status === 'Pending').length;
  const inProgressReports = complaints.filter(c => c.status === 'In Progress').length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Top Navbar */}
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
        
        {/* Assignment Header Widget */}
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
              
              {/* NEW TAB: Assigned Reports */}
              <button onClick={() => setActiveTab('assigned')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'assigned' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                My Special Reports
                {assignedComplaints.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === 'assigned' ? 'bg-blue-600 text-white' : 'bg-white text-blue-900'}`}>
                    {assignedComplaints.length}
                  </span>
                )}
              </button>

              <button onClick={() => setActiveTab('announcements')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                Post Announcement
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'issues' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Analytics Row */}
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

            {/* Complaints Master List */}
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
                        <th className="px-6 py-4 font-bold">Issue Details & Evidence</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {complaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'Unknown Student'}
                            </div>
                            <div className="text-xs text-slate-500">
                              Roll: {complaint.student ? complaint.student.identifier : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4 items-start">
                              {/* NEW: Displaying the image thumbnail if it exists */}
                              {complaint.image && (
                                <a href={`http://localhost:5000${complaint.image}`} target="_blank" rel="noreferrer" className="shrink-0">
                                  <img src={`http://localhost:5000${complaint.image}`} alt="Issue Evidence" className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm hover:opacity-80 transition-opacity" />
                                </a>
                              )}
                              <div className="max-w-xs">
                                <div className="font-bold mb-1 truncate">{complaint.title}</div>
                                <div className="text-xs text-slate-500 truncate mb-1">{complaint.location}</div>
                                <div className="text-[10px] text-slate-400">{formatDate(complaint.createdAt)}</div>
                                
                                {/* If the student assigned this to someone specific, show it in the general list */}
                                {complaint.assignedAdmin && (
                                  <div className="mt-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded w-fit">
                                    Directed to: {complaint.assignedAdmin.firstName} {complaint.assignedAdmin.lastName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300">
                              {complaint.category}
                            </span>
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

        {/* TAB 2: MY SPECIAL REPORTS (ASSIGNED DIRECTLY TO THIS ADMIN) */}
        {activeTab === 'assigned' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-indigo-100 dark:border-indigo-800 bg-white/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-400">Directly Assigned To You</h3>
                <p className="text-sm text-slate-500 mt-1">Students specifically requested your attention on these reports.</p>
              </div>

              {isLoading ? (
                <div className="p-10 text-center text-slate-500">Loading your assignments...</div>
              ) : assignedComplaints.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">You have no directly assigned reports right now.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 border-b border-indigo-100 dark:border-indigo-800">
                      <tr>
                        <th className="px-6 py-4 font-bold">Student Info</th>
                        <th className="px-6 py-4 font-bold">Issue Details & Evidence</th>
                        <th className="px-6 py-4 font-bold">Category</th>
                        <th className="px-6 py-4 font-bold">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50 dark:divide-indigo-900/30">
                      {assignedComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-white dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {complaint.student ? `${complaint.student.firstName} ${complaint.student.lastName}` : 'Unknown'}
                            </div>
                            <div className="text-xs text-slate-500">Roll: {complaint.student?.identifier}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4 items-start">
                              {/* Image Thumbnail */}
                              {complaint.image && (
                                <a href={`http://localhost:5000${complaint.image}`} target="_blank" rel="noreferrer" className="shrink-0">
                                  <img src={`http://localhost:5000${complaint.image}`} alt="Issue Evidence" className="w-14 h-14 rounded-lg object-cover border border-indigo-200 dark:border-indigo-700 shadow-sm hover:opacity-80 transition-opacity" />
                                </a>
                              )}
                              <div className="max-w-xs">
                                <div className="font-bold mb-1 truncate text-indigo-800 dark:text-indigo-400">{complaint.title}</div>
                                <div className="text-xs text-slate-500 truncate mb-1">{complaint.location}</div>
                                <div className="text-[10px] text-slate-400">{formatDate(complaint.createdAt)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold">
                              {complaint.category}
                            </span>
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

        {/* Placeholder for Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center animate-in fade-in duration-500 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24M11 5.882a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m-3 6a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m6 9a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Announcements Center</h3>
            <p className="text-slate-500">The broadcasting feature is ready to be connected to the database.</p>
          </div>
        )}

      </main>
    </div>
  );
}