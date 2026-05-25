import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../../components/common/ThemeToggle';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [management, setManagement] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // NEW STATE
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '', category: 'Hostel', location: '', description: '', assignedAdmin: '', image: null
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      toast.error('Please log in to access the dashboard.');
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    fetchMyComplaints(token);
    fetchManagement(token);
    fetchAnnouncements(token); // NEW FETCH
  }, [navigate]);

  const fetchMyComplaints = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints/my-complaints', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch complaints');
      setComplaints(await response.json());
    } catch (error) { toast.error('Could not load your reports.'); } finally { setIsLoading(false); }
  };

  const fetchManagement = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/admins', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setManagement(await response.json());
    } catch (error) { console.error("Failed to load management directory"); }
  };

  const fetchAnnouncements = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/announcements', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setAnnouncements(await response.json());
    } catch (error) { console.error("Failed to load announcements"); }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) return toast.error("Image must be smaller than 5MB");
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('description', formData.description);
    if (formData.assignedAdmin) formDataToSend.append('assignedAdmin', formData.assignedAdmin);
    if (formData.image) formDataToSend.append('image', formData.image);

    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to submit complaint');

      toast.success('Complaint submitted successfully!');
      setFormData({ title: '', category: 'Hostel', location: '', description: '', assignedAdmin: '', image: null });
      setImagePreview(null);
      if (document.getElementById('imageUpload')) document.getElementById('imageUpload').value = '';
      
      setActiveTab('overview');
      fetchMyComplaints(token);
    } catch (error) { toast.error(error.message); } finally { setIsSubmitting(false); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center text-white font-black text-sm shadow-sm">CC</div>
            <span className="font-bold text-lg tracking-tight">Student Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-600 dark:text-slate-300 uppercase">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sticky top-24 shadow-sm">
            <nav className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'overview' ? 'bg-red-50 dark:bg-red-500/10 text-red-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard Overview
              </button>
              <button onClick={() => setActiveTab('submit')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'submit' ? 'bg-red-50 dark:bg-red-500/10 text-red-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Report New Issue
              </button>
              <button onClick={() => setActiveTab('management')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'management' ? 'bg-red-50 dark:bg-red-500/10 text-red-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Management Directory
              </button>
              <button onClick={() => setActiveTab('announcements')} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'announcements' ? 'bg-red-50 dark:bg-red-500/10 text-red-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24M11 5.882a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m-3 6a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0m6 9a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0" /></svg>
                  Campus Notices
                </div>
                {announcements.length > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{announcements.length}</span>}
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Welcome back, {user.firstName}</h2>
                <p className="text-slate-500 dark:text-slate-400">Here is the status of your reported issues.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mt-8">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-bold text-lg">Your Recent Reports</h3>
                </div>
                
                {isLoading ? (
                  <div className="p-8 text-center text-slate-500">Loading your reports...</div>
                ) : complaints.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">You haven't submitted any reports yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {complaints.map((complaint) => (
                      <div key={complaint._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex gap-4">
                            {complaint.image ? (
                              <img src={`http://localhost:5000${complaint.image}`} alt="Issue" className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 hidden sm:block" />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 hidden sm:flex text-slate-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{complaint.category}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                <span className="text-xs font-medium text-slate-400">{formatDate(complaint.createdAt)}</span>
                              </div>
                              <h4 className="text-lg font-bold mb-1">{complaint.title}</h4>
                              <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {complaint.location}
                              </p>
                              {complaint.assignedAdmin && (
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 w-fit px-2 py-0.5 rounded">
                                  Directed to: {complaint.assignedAdmin.firstName} {complaint.assignedAdmin.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap self-start sm:self-center ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'submit' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">Report an Issue</h2>
                <p className="text-slate-500 dark:text-slate-400">Provide clear details so the administration can resolve it quickly.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Issue Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="E.g., Broken projector in Room 402" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium appearance-none">
                        <option>Hostel</option>
                        <option>Maintenance</option>
                        <option>IT Support</option>
                        <option>Electricity</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Specific Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="E.g., Block A, 2nd Floor" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium" />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
                    <label className="block text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2">Direct to Specific Admin <span className="text-slate-500 font-normal">(Optional)</span></label>
                    <select name="assignedAdmin" value={formData.assignedAdmin} onChange={handleInputChange} className="w-full p-3.5 rounded-lg bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium appearance-none">
                      <option value="">-- Route to General Inbox --</option>
                      {management.map(admin => (
                        <option key={admin._id} value={admin._id}>
                          {admin.firstName} {admin.lastName} - {admin.stream} {admin.branch}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400/80 mt-2 font-medium">Leave this blank to let the system automatically assign your issue to the correct department.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detailed Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" placeholder="Please describe the exact problem..." className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-medium resize-none"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Photo Evidence (Optional)</label>
                    <div className="flex flex-col items-center justify-center w-full">
                      {!imagePreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-red-600 dark:text-red-400">Click to upload</span></p>
                            <p className="text-xs text-slate-400">PNG or JPG (MAX. 5MB)</p>
                          </div>
                          <input id="imageUpload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      ) : (
                        <div className="relative w-full animate-in zoom-in duration-300">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" />
                          <button 
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: null }));
                              setImagePreview(null);
                              document.getElementById('imageUpload').value = '';
                            }}
                            className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-md transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          <p className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg w-full text-center border border-emerald-200 dark:border-emerald-800">
                            ✓ Image Selected: {formData.image.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 shadow-md transition-all duration-300 disabled:opacity-50">
                      {isSubmitting ? 'Submitting Report...' : 'Submit Report securely'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'management' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">Management Directory</h2>
                <p className="text-slate-500 dark:text-slate-400">Find the contact details for the administrators responsible for your department.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {management.map((admin) => (
                  <div key={admin._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full flex items-center justify-center text-xl font-black uppercase shadow-sm">
                        {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{admin.firstName} {admin.lastName}</h3>
                        <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md">
                          {admin.stream} {admin.branch} — Semester {admin.semester}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <a href={`mailto:${admin.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{admin.email}</a>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <a href={`tel:${admin.contactNumber}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{admin.contactNumber || 'Not provided'}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CAMPUS NOTICES / ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight mb-2">Campus Notices & Alerts</h2>
                <p className="text-slate-500 dark:text-slate-400">Official broadcasts and documents from the administration.</p>
              </div>

              <div className="space-y-6">
                {announcements.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 font-medium">No announcements published yet.</p>
                  </div>
                ) : announcements.map((notice) => (
                  <div key={notice._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    
                    <div className={`p-4 flex flex-col items-center justify-center shrink-0 w-full md:w-32 ${notice.priority === 'Emergency' ? 'bg-rose-500 text-white' : notice.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {notice.priority === 'Emergency' && <svg className="w-8 h-8 mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                      <span className="text-xs font-black uppercase tracking-wider">{notice.priority}</span>
                      <span className="text-[10px] mt-2 text-center opacity-80">{formatDate(notice.createdAt)}</span>
                    </div>

                    <div className="p-6 md:p-8 w-full">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{notice.title}</h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {notice.admin?.firstName?.charAt(0) || 'A'}
                          </div>
                          <span className="text-xs font-semibold text-slate-500">Posted by {notice.admin?.firstName} {notice.admin?.lastName}</span>
                        </div>
                        
                        {notice.attachment && (
                          notice.fileType === 'image' ? (
                            <a href={`http://localhost:5000${notice.attachment}`} target="_blank" rel="noreferrer" className="block max-w-sm mt-4 sm:mt-0">
                              <img src={`http://localhost:5000${notice.attachment}`} alt="Attachment" className="w-full h-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:opacity-90 transition-opacity" />
                            </a>
                          ) : (
                            <a href={`http://localhost:5000${notice.attachment}`} download={notice.originalFileName} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-bold text-sm">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              Download {notice.fileType.toUpperCase()}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}