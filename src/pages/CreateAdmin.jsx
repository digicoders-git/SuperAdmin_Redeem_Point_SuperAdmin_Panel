import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { ArrowLeft, UserPlus, Copy, Check } from "lucide-react";

export default function CreateAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ adminId: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/superadmin/admins", form);
      setCreated(data.admin);
      setForm({ adminId: "", password: "", name: "" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to create admin" });
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
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate("/admins")} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900">Register New Admin</h1>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Form */}
        {!created ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <UserPlus size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Admin Details</p>
                <p className="text-xs text-gray-500">A unique referral code will be auto-generated</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <input
                type="text"
                placeholder="Admin ID *"
                value={form.adminId}
                onChange={(e) => setForm({ ...form, adminId: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <input
                type="password"
                placeholder="Password *"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition active:scale-[0.98]"
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </div>
        ) : (
          /* Success Card */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Admin Created!</p>
                <p className="text-xs text-gray-500">{created.name || created.adminId}</p>
              </div>
            </div>

            {[
              { label: "Admin ID", value: created.adminId, key: "adminId" },
              { label: "Shop ID", value: created.shopId, key: "shopId" },
              { label: "Referral Code", value: created.referralCode, key: "referralCode" },
            ].map(({ label, value, key }) => (
              <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-bold text-gray-800 text-sm">{value}</p>
                </div>
                <button onClick={() => copy(value, key)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200">
                  {copied === key ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                </button>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCreated(null)}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm"
              >
                Create Another
              </button>
              <button
                onClick={() => navigate("/admins")}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm"
              >
                View All Admins
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
