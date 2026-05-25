import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/common/ThemeToggle';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    identifier: '',
    password: '',
    role: 'student',
    stream: '',
    branch: '',
    semester: '',
    contactNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return toast.error('Please provide your full name.');
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return toast.error('Please provide a valid university email address.');
    }
    if (!formData.identifier.trim()) {
      return toast.error(`${formData.role === 'student' ? 'Roll Number' : 'Employee ID'} is required.`);
    }
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters long.');
    }
    
    // Strict validation ONLY for Admins
    if (formData.role === 'admin') {
      if (!formData.stream.trim() || !formData.branch.trim() || !formData.semester.trim() || !formData.contactNumber.trim()) {
        return toast.error('Admins must provide Stream, Branch, Semester, and Contact Number.');
      }
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      if (data.role === 'admin') {
        toast.success('Account created! Admin access is pending Super Admin approval.', { duration: 6000, icon: '🛡️' });
        navigate('/login');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Account created successfully! Welcome in.');
        navigate('/');
      }
      
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        toast.error('Cannot connect to server. Is your backend running?');
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex p-6 items-center justify-center transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/10 blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 flex overflow-hidden min-h-[650px] relative z-10">
        
        {/* LEFT SIDE (BRANDING) */}
        <div className="hidden md:flex w-5/12 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-200 dark:border-slate-800">
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Students on Campus" className="absolute inset-0 w-full h-full object-cover opacity-80"/>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>

          <div className="relative z-10 flex flex-col h-full justify-between p-12 w-full">
            <Link to="/" className="text-2xl font-black flex items-center gap-3 text-white hover:scale-105 transition-transform origin-left w-fit drop-shadow-md">
              <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center text-white text-lg shadow-md">CC</div>
              Campus Connect
            </Link>
            
            <div className="mb-10">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wider uppercase shadow-sm">Join The Community</div>
              <h2 className="text-4xl font-black text-white mb-4 leading-tight drop-shadow-md">Start shaping your campus today.</h2>
              <p className="text-slate-200 font-medium leading-relaxed text-sm drop-shadow">Register your account to manage infrastructure requests, track resolutions, and engage with the administration.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (FORM) */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
          <div className="max-w-md w-full">
            
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Create an account</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Enter your student or admin details to get started.</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  formData.role === 'student'
                    ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  formData.role === 'admin'
                    ? 'bg-white dark:bg-slate-950 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Administrator
              </button>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">University Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@rayatbahra.edu" className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {formData.role === 'student' ? 'Roll / Register Number' : 'Employee ID'}
                </label>
                <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} placeholder={formData.role === 'student' ? 'e.g. 2305609' : 'e.g. EMP123'} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm" />
              </div>

              {/* STRICT ADMIN-ONLY FIELDS */}
              {formData.role === 'admin' && (
                <div className="space-y-4 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in zoom-in duration-300">
                  <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-800/50 pb-2">Admin Assignment Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stream</label>
                      <input type="text" name="stream" value={formData.stream} onChange={handleChange} placeholder="B.Tech" className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
                      <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="CSE" className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Semester</label>
                      <input type="text" name="semester" value={formData.semester} onChange={handleChange} placeholder="6" className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm  text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Number</label>
                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="+91 98765 43210" className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm  text-white" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    autoComplete="new-password" 
                    placeholder="••••••••" 
                    className="w-full p-3.5 pr-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Must be at least 8 characters.</p>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 mt-2 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              Already have an account? <Link to="/login" className="text-red-600 dark:text-red-400 font-bold hover:underline ml-1">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}