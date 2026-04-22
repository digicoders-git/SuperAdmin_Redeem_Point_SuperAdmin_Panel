import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.post("/superadmin/login", form);
      localStorage.setItem("saToken", data.token);
      localStorage.setItem("saInfo", JSON.stringify(data.superAdmin));
      await Swal.fire({ icon: "success", title: "Welcome Back!", timer: 1500, showConfirmButton: false });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErr(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] font-sans flex flex-col items-center justify-center px-5">
      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-72 h-72 bg-[#800000]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-3xl shadow-lg shadow-[#800000]/30 flex items-center justify-center mb-4">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a0000] tracking-tight">Super Admin</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Control Center Login</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/10 border border-[#ffe4e4] p-7">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Sign in to continue</h2>

          {err && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold rounded-2xl px-4 py-3 mb-4 border border-red-100">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Username</label>
              <input
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-[#fff5f5] border-2 border-[#ffe4e4] rounded-2xl px-4 py-3.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/50 transition-colors pr-12"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
