import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuthHero from "../components/AuthHero.jsx";
import Spinner from "../components/Spinner.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex flex-col px-6 sm:px-10 lg:px-14 py-8 order-1">
        <div className="flex justify-start items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-violet-400 to-violet-600 flex items-center justify-center">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">
            ExpenseTracker
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
              Sign In
            </h2>
            <p className="text-slate-500 mb-10">Please login to continue</p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-violet-500 rounded-2xl px-5 py-4 text-slate-900 text-sm focus:outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-violet-500 rounded-2xl px-5 py-4 pr-12 text-slate-900 text-sm focus:outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-br from-violet-400 to-violet-600  active:bg-violet-800 text-white font-semibold py-4 rounded-2xl transition shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-slate-500">
              No Account Yet?{" "}
              <Link
                to="/register"
                className="text-violet-600 font-semibold hover:text-violet-700 transition"
              >
                Get Yours Now
              </Link>
            </p>
          </div>
        </div>

        <div className="flex justify-start gap-6 text-xs text-slate-500">
          <a className="hover:text-slate-900 transition cursor-pointer">
            Privacy Policy
          </a>
          <a className="hover:text-slate-900 transition cursor-pointer">
            Terms
          </a>
          <a className="hover:text-slate-900 transition cursor-pointer">FAQ</a>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] order-2">
        <AuthHero headline="Empower" subheadline="Your financial future" />
      </div>
    </div>
  );
};

export default Login;
