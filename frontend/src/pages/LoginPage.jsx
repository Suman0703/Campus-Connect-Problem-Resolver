import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/common/ThemeToggle';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Default to student login
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'student' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier.trim()) {
      return toast.error(`Please enter your ${formData.role === 'student' ? 'Roll Number or Email' : 'Employee ID or Email'}`);
    }
    if (!formData.password) {
      return toast.error('Please enter your password.');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      toast.success(`Welcome back, ${data.firstName}!`);
      
      // Send them to the Home Page (which will smartly show their specific dashboard button)
      navigate('/');
      
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

      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 flex overflow-hidden min-h-[600px] relative z-10">
        
        {/* LEFT SIDE (BRANDING) */}
        <div className="hidden md:flex w-5/12 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-200 dark:border-slate-800">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="University Library" className="absolute inset-0 w-full h-full object-cover opacity-80"/>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>

          <div className="relative z-10 flex flex-col h-full justify-between p-12 w-full">
            <Link to="/" className="text-2xl font-black flex items-center gap-3 text-white hover:scale-105 transition-transform origin-left w-fit drop-shadow-md">
              <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center text-white text-lg shadow-md">CC</div>
              Campus Connect
            </Link>
            
            <div className="mb-10">
              <h2 className="text-4xl font-black text-white mb-4 leading-tight drop-shadow-md">Welcome Back.</h2>
              <p className="text-slate-200 font-medium leading-relaxed text-sm drop-shadow">Log in to manage your campus requests, view live updates, and connect with the administration.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (FORM) */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
          <div className="max-w-md w-full">
            
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Sign in</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Welcome back! Please enter your details.</p>
            </div>

            {/* Role Selection Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
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
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {formData.role === 'student' ? 'Email or Roll Number' : 'Email or Employee ID'}
                </label>
                <input 
                  type="text" 
                  name="identifier" 
                  value={formData.identifier} 
                  onChange={handleChange} 
                  placeholder={formData.role === 'student' ? 'name@rayatbahra.edu or 2305609' : 'admin@campusconnect.com'} 
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
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
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 mt-4 rounded-xl font-bold text-white bg-red-700 hover:bg-red-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              Don't have an account? <Link to="/signup" className="text-red-600 dark:text-red-400 font-bold hover:underline ml-1">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}