import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/common/ThemeToggle';

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchAnnouncements(token);
  }, [navigate]);

  const fetchAnnouncements = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch announcements');
      setAnnouncements(await response.json());
    } catch (error) {
      toast.error('Could not load announcements.');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Delete functionality
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement? The attached file will also be permanently removed.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete announcement');
      
      toast.success('Announcement deleted successfully!');
      // Instantly remove it from the screen
      setAnnouncements(announcements.filter(notice => notice._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getDashboardLink = () => {
    if (user?.role === 'superadmin') return '/super-admin-dashboard';
    if (user?.role === 'admin') return '/admin-dashboard';
    return '/dashboard';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link to={getDashboardLink()} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm shadow-sm">CC</div>
            <span className="font-bold text-lg tracking-tight">Updates & Notices</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to={getDashboardLink()} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight mb-3">
            {user.role === 'admin' ? 'Super Admin Directives' : 'Campus Announcements'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {user.role === 'admin' 
              ? 'Official operational updates and documents from the System Overseer.' 
              : 'Official notices, emergency alerts, and documents from your department Administrators.'}
          </p>
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Checking for new updates...</div>
          ) : announcements.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24M11 5.882a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m-3 6a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m6 9a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0" /></svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">You are all caught up!</p>
              <p className="text-slate-500 text-sm mt-1">No new announcements have been posted for you.</p>
            </div>
          ) : (
            announcements.map((notice) => (
              <div key={notice._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow relative">
                
                <div className={`p-4 flex flex-col items-center justify-center shrink-0 w-full md:w-36 ${notice.priority === 'Emergency' ? 'bg-rose-600 text-white' : notice.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {notice.priority === 'Emergency' && <svg className="w-8 h-8 mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                  <span className="text-xs font-black uppercase tracking-wider">{notice.priority}</span>
                  <span className="text-[10px] mt-2 text-center font-medium opacity-80">{formatDate(notice.createdAt)}</span>
                </div>

                <div className="p-6 md:p-8 w-full">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{notice.title}</h3>
                    
                    {/* NEW: Conditional Delete Button */}
                    {(user.role === 'superadmin' || user._id === notice.admin?._id) && (
                      <button 
                        onClick={() => handleDelete(notice._id)} 
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0" 
                        title="Delete Announcement"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {notice.admin?.firstName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {notice.admin?.role === 'superadmin' ? 'System Overseer' : `${notice.admin?.firstName} ${notice.admin?.lastName}`}
                        </p>
                        {notice.admin?.role !== 'superadmin' && (
                          <p className="text-[10px] text-slate-500 font-semibold">{notice.admin?.stream} {notice.admin?.branch}</p>
                        )}
                      </div>
                    </div>
                    
                    {notice.attachment && (
                      notice.fileType === 'image' ? (
                        <a href={`http://localhost:5000${notice.attachment}`} target="_blank" rel="noreferrer" className="block max-w-sm mt-4 sm:mt-0">
                          <img src={`http://localhost:5000${notice.attachment}`} alt="Attachment" className="w-full h-auto max-h-48 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:opacity-90 transition-opacity" />
                        </a>
                      ) : (
                        <a href={`http://localhost:5000${notice.attachment}`} download={notice.originalFileName} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors font-bold text-sm shadow-sm border border-blue-100 dark:border-blue-800/50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Open Document
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}