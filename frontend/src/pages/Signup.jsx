import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { getDashboardPath } from "../utils/dashboard";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const user = await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast("Account created successfully!", "success");
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join the ImpactHub community">
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full name</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500">
            <FiUser className="text-slate-400" size={18} />
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" placeholder="Jane Doe" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500">
            <FiMail className="text-slate-400" size={18} />
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">I am a...</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-amber-500 outline-none">
            <option value="student">Student</option>
            <option value="manager">Project Manager</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500">
            <FiLock className="text-slate-400" size={18} />
            <input type={show ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" />
            <button type="button" onClick={() => setShow(!show)} className="text-slate-400">{show ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm password</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-brand-500">
            <FiLock className="text-slate-400" size={18} />
            <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" />
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full">Create Account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;
