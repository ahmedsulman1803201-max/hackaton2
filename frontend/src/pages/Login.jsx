import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "../components/layout/AuthLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { getDashboardPath } from "../utils/dashboard";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(" ")[0]}!`, "success");
      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your ImpactHub account">
      <div className="mb-4 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 space-y-1">
        <p className="font-medium text-slate-600 dark:text-slate-400 mb-1">Demo accounts</p>
        <p>student@impacthub.com / student123</p>
        <p>manager@impacthub.com / manager123</p>
        <p>admin@impacthub.com / admin123</p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email or account ID</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500">
            <FiMail className="text-slate-400 shrink-0" size={18} />
            <input type="text" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500">
            <FiLock className="text-slate-400 shrink-0" size={18} />
            <input type={show ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 outline-none text-sm bg-transparent" placeholder="••••••••" />
            <button type="button" onClick={() => setShow(!show)} className="text-slate-400 hover:text-slate-600">
              {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full">Sign In</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-amber-600 font-semibold hover:underline">Create account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
