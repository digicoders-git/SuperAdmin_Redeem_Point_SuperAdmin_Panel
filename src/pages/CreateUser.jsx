import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { ArrowLeft, UserPlus, Check, Copy } from "lucide-react";

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: "", password: "", name: "", shopId: "" });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/superadmin/users", form);
      setCreated(data.user);
      setForm({ mobile: "", password: "", name: "", shopId: "" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to create user" });
    } finally {
      setLoading(false);
    }
  };

  const copy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#800000] border-b border-[#800000]/10 px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-lg">
        <button onClick={() => navigate("/users")} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/20">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="font-bold text-white">Register New User</h1>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Form */}
        {!created ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/5 border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <UserPlus size={24} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">User Details</p>
                <p className="text-xs text-gray-400">Register a customer with mobile and password</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Password *</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Shop ID (Optional)</label>
                <input
                  type="text"
                  placeholder="Link to a specific shop"
                  value={form.shopId}
                  onChange={(e) => setForm({ ...form, shopId: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800000] hover:bg-[#600000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#800000]/20 transition active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        ) : (
          /* Success Card */
          <div className="bg-white rounded-3xl shadow-xl shadow-[#800000]/5 border border-gray-100 p-6 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center py-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">User Registered!</h2>
              <p className="text-sm text-gray-400 mt-1">The customer can now login with their mobile</p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Name", value: created.name, key: "name" },
                { label: "Mobile Number", value: created.mobile, key: "mobile" },
                { label: "Shop ID", value: created.shopId || "Global / None", key: "shopId" },
              ].map(({ label, value, key }) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="font-bold text-gray-800 text-sm">{value}</p>
                  </div>
                  <button onClick={() => copy(value, key)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 shadow-sm active:scale-90 transition">
                    {copied === key ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCreated(null)}
                className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition"
              >
                Add Another
              </button>
              <button
                onClick={() => navigate("/users")}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl text-sm active:scale-95 transition"
              >
                Back to List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
