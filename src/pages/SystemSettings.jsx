import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Settings, Loader2, Save, ArrowLeft, Calendar, Phone } from "lucide-react";
import Swal from "sweetalert2";

export default function SystemSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ freeTrialDays: 7, supportPhone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/subscriptions/settings")
      .then(({ data }) => setSettings({ freeTrialDays: 7, supportPhone: "", ...data.settings }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/subscriptions/settings", settings);
      Swal.fire({ icon: "success", title: "Settings Updated!", timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not update settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-4 transition">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-2xl">System Settings</h1>
              <p className="text-white/70 text-sm">Configure global system parameters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-slate-800" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Free Trial */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Free Trial Configuration</h2>
                  <p className="text-xs text-gray-500">Set default trial period for new admins</p>
                </div>
              </div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Free Trial Days</label>
              <input
                type="number" min="1" max="365"
                value={settings.freeTrialDays}
                onChange={(e) => setSettings({ ...settings, freeTrialDays: Number(e.target.value) })}
                required
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-bold text-gray-900 focus:outline-none focus:border-slate-800 transition"
                placeholder="e.g. 7"
              />
              <p className="text-xs text-gray-400 mt-2">New admins will receive a {settings.freeTrialDays}-day free trial upon registration</p>
            </div>

            {/* Support WhatsApp */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Support WhatsApp Number</h2>
                  <p className="text-xs text-gray-500">Shown to admins & users for contact support</p>
                </div>
              </div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">WhatsApp Number (with country code)</label>
              <input
                type="tel"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-bold text-gray-900 focus:outline-none focus:border-green-500 transition"
                placeholder="e.g. 919876543210"
              />
              <p className="text-xs text-gray-400 mt-2">Enter number without + sign. e.g. 919876543210 for India</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Settings</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
