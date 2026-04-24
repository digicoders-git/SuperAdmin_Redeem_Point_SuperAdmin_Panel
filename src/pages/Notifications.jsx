import { useState, useEffect } from "react";
import api from "../api/axios";
import { Bell, Send, Loader2, Users, User, Store, Trash2, Clock } from "lucide-react";
import Swal from "sweetalert2";
import BottomNav from "../components/BottomNav";

export default function Notifications() {
  const [form, setForm] = useState({
    recipientType: "all_users",
    recipientId: "",
    shopId: "",
    title: "",
    message: "",
    type: "announcement",
  });
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = () => {
    api.get("/notifications/superadmin/history")
      .then(({ data }) => setHistory(data.notifications || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => {
    Promise.all([
      api.get("/superadmin/admins"),
      api.get("/superadmin/users"),
    ])
      .then(([adminRes, userRes]) => {
        setAdmins(adminRes.data.admins || []);
        setUsers(userRes.data.users || []);
        const uniqueShops = [...new Set(adminRes.data.admins.map(a => a.shopId))].filter(Boolean);
        setShops(uniqueShops);
      })
      .catch(() => {});
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      Swal.fire({ icon: "error", title: "Error", text: "Title and message are required" });
      return;
    }

    // Confirm before sending
    const recipientLabel = recipientTypes.find(r => r.value === form.recipientType)?.label || form.recipientType;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Send Notification?",
      html: `<div class="text-left text-sm space-y-2">
        <p><b>To:</b> ${recipientLabel}</p>
        <p><b>Title:</b> ${form.title}</p>
        <p><b>Message:</b> ${form.message}</p>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "Yes, Send",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#800000",
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const payload = {
        recipientType: form.recipientType,
        title: form.title,
        message: form.message,
        type: form.type,
      };
      if (form.recipientType === "admin" && form.recipientId) payload.recipientId = form.recipientId;
      else if (form.recipientType === "user" && form.recipientId) payload.recipientId = form.recipientId;
      else if (form.recipientType === "shop_users" && form.shopId) payload.shopId = form.shopId;

      const { data } = await api.post("/notifications/send", payload);
      await Swal.fire({ icon: "success", title: "Notification Sent!", text: `Sent to ${data.count} recipient(s)`, confirmButtonColor: "#800000" });
      setForm({ recipientType: "all_users", recipientId: "", shopId: "", title: "", message: "", type: "announcement" });
      loadHistory();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to send notification" });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotif = async (title, message) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete Notification?",
      text: "This will delete this notification for all recipients.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete("/notifications/superadmin/batch", { data: { title, message } });
      setHistory(prev => prev.filter(n => !(n.title === title && n.message === message)));
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not delete notification" });
    }
  };

  const recipientTypes = [
    { value: "all_users", label: "All Users", icon: Users },
    { value: "all_admins", label: "All Admins", icon: Users },
    { value: "shop_users", label: "Shop Users", icon: Store },
    { value: "admin", label: "Specific Admin", icon: User },
    { value: "user", label: "Specific User", icon: User },
  ];

  // Deduplicate by title+message only
  const uniqueHistory = history.reduce((acc, n) => {
    const exists = acc.find(x => x.title === n.title && x.message === n.message);
    if (!exists) acc.push(n);
    return acc;
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-2xl">Send Notification</h1>
              <p className="text-white/70 text-sm">Broadcast messages to users and admins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-5">
          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Send To</label>
            <div className="grid grid-cols-2 gap-3">
              {recipientTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, recipientType: type.value, recipientId: "", shopId: "" })}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition ${
                      form.recipientType === type.value
                        ? "border-[#800000] bg-[#ffe4e4] text-[#800000]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-semibold">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.recipientType === "admin" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Admin</label>
              <select value={form.recipientId} onChange={(e) => setForm({ ...form, recipientId: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition" required>
                <option value="">Choose an admin</option>
                {admins.map((admin) => <option key={admin._id} value={admin._id}>{admin.name} ({admin.adminId})</option>)}
              </select>
            </div>
          )}

          {form.recipientType === "user" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select User</label>
              <select value={form.recipientId} onChange={(e) => setForm({ ...form, recipientId: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition" required>
                <option value="">Choose a user</option>
                {users.map((user) => <option key={user._id} value={user._id}>{user.name} ({user.mobile})</option>)}
              </select>
            </div>
          )}

          {form.recipientType === "shop_users" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Shop</label>
              <select value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition" required>
                <option value="">Choose a shop</option>
                {shops.map((shopId) => { const admin = admins.find(a => a.shopId === shopId); return <option key={shopId} value={shopId}>{shopId} {admin ? `(${admin.name})` : ""}</option>; })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition">
              <option value="announcement">Announcement</option>
              <option value="system">System</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter notification title" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Enter notification message" rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition resize-none" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Notification</>}
          </button>
        </form>

        {/* Notification History */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[#800000]" />
            <h2 className="font-bold text-gray-900 text-lg">Sent History</h2>
          </div>
          {historyLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse h-20" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <Bell size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uniqueHistory.map(n => (
                <div key={n._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffe4e4] text-[#800000] capitalize">{n.type}</span>
                        <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteNotif(n.title, n.message)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 transition active:scale-95">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <BottomNav />
    </>
  );
}
