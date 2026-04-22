import { useState, useEffect } from "react";
import api from "../api/axios";
import { Bell, Send, Loader2, Users, User, Store } from "lucide-react";
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

  useEffect(() => {
    // Fetch admins and users for dropdown
    Promise.all([
      api.get("/superadmin/admins"),
      api.get("/superadmin/users"),
    ])
      .then(([adminRes, userRes]) => {
        setAdmins(adminRes.data.admins || []);
        setUsers(userRes.data.users || []);
        
        // Extract unique shop IDs from admins
        const uniqueShops = [...new Set(adminRes.data.admins.map(a => a.shopId))].filter(Boolean);
        setShops(uniqueShops);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      Swal.fire({ icon: "error", title: "Error", text: "Title and message are required" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        recipientType: form.recipientType,
        title: form.title,
        message: form.message,
        type: form.type,
      };

      if (form.recipientType === "admin" && form.recipientId) {
        payload.recipientId = form.recipientId;
      } else if (form.recipientType === "user" && form.recipientId) {
        payload.recipientId = form.recipientId;
      } else if (form.recipientType === "shop_users" && form.shopId) {
        payload.shopId = form.shopId;
      }

      const { data } = await api.post("/notifications/send", payload);
      await Swal.fire({
        icon: "success",
        title: "Notification Sent!",
        text: `Sent to ${data.count} recipient(s)`,
        confirmButtonColor: "#800000",
      });

      // Reset form
      setForm({
        recipientType: "all_users",
        recipientId: "",
        shopId: "",
        title: "",
        message: "",
        type: "announcement",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to send notification",
      });
    } finally {
      setLoading(false);
    }
  };

  const recipientTypes = [
    { value: "all_users", label: "All Users", icon: Users },
    { value: "all_admins", label: "All Admins", icon: Users },
    { value: "shop_users", label: "Shop Users", icon: Store },
    { value: "admin", label: "Specific Admin", icon: User },
    { value: "user", label: "Specific User", icon: User },
  ];

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

          {/* Specific Admin Dropdown */}
          {form.recipientType === "admin" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Admin</label>
              <select
                value={form.recipientId}
                onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition"
                required
              >
                <option value="">Choose an admin</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name} ({admin.adminId})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Specific User Dropdown */}
          {form.recipientType === "user" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select User</label>
              <select
                value={form.recipientId}
                onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition"
                required
              >
                <option value="">Choose a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.mobile})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Shop ID Dropdown */}
          {form.recipientType === "shop_users" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Shop</label>
              <select
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition"
                required
              >
                <option value="">Choose a shop</option>
                {shops.map((shopId) => {
                  const admin = admins.find(a => a.shopId === shopId);
                  return (
                    <option key={shopId} value={shopId}>
                      {shopId} {admin ? `(${admin.name})` : ""}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-2">Or enter shop ID manually below</p>
              <input
                type="text"
                value={form.shopId}
                onChange={(e) => setForm({ ...form, shopId: e.target.value })}
                placeholder="Or type shop ID manually"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition mt-2"
              />
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition"
            >
              <option value="announcement">Announcement</option>
              <option value="system">System</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter notification title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Enter notification message"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#800000] focus:ring-0 transition resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#800000]/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Notification
              </>
            )}
          </button>
        </form>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-5">
          <p className="text-sm text-blue-700">
            <span className="font-bold">💡 Tip:</span> Notifications are sent instantly to selected recipients. Users will see them in their notification panel.
          </p>
        </div>
      </div>
      </div>
      <BottomNav />
    </>
  );
}
