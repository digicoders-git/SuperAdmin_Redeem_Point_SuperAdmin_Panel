import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import Swal from "sweetalert2";
import { ShieldCheck, KeyRound, LogOut, Eye, EyeOff, Loader2, User, X } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const saInfo = JSON.parse(localStorage.getItem("saInfo") || "{}");
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword)
      return Swal.fire({ icon: "error", title: "Mismatch", text: "New passwords do not match" });
    if (pwdForm.newPassword.length < 6)
      return Swal.fire({ icon: "error", title: "Too short", text: "Password must be at least 6 characters" });
    setPwdSaving(true);
    try {
      const { data } = await api.patch("/superadmin/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      localStorage.setItem("saToken", data.token);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordModal(false);
      Swal.fire({ icon: "success", title: "Password Changed!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not change password" });
    } finally {
      setPwdSaving(false);
    }
  };

  const logout = async () => {
    const res = await Swal.fire({
      title: "Logout?", text: "Are you sure you want to logout?",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Yes, Logout", confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;
    localStorage.removeItem("saToken");
    localStorage.removeItem("saInfo");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      {/* Header */}
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Profile</h1>
            <p className="text-white/80 font-medium text-sm">Manage your account</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <User className="text-white" size={22} />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Profile Info Card */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#ffe4e4] rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={30} className="text-[#800000]" />
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-lg">{saInfo.username || "Super Admin"}</p>
              <span className="inline-block bg-[#800000]/10 text-[#800000] text-xs font-bold px-3 py-1 rounded-full mt-1">
                Super Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full bg-white border-2 border-[#800000]/20 text-[#800000] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition hover:bg-[#fff5f5] shadow-sm"
        >
          <KeyRound size={20} /> Change Password
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-white border-2 border-red-100 text-red-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition hover:bg-red-50 shadow-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-t-3xl px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <KeyRound size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Change Password</h3>
                  <p className="text-white/70 text-xs">Update your login password</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-white/70 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={changePassword} className="p-6 space-y-4">
              {[
                { key: "currentPassword", placeholder: "Current Password", show: showCurrent, setShow: setShowCurrent },
                { key: "newPassword", placeholder: "New Password (min 6 chars)", show: showNew, setShow: setShowNew },
                { key: "confirmPassword", placeholder: "Confirm New Password", show: showConfirm, setShow: setShowConfirm },
              ].map(({ key, placeholder, show, setShow }) => (
                <div key={key} className="relative">
                  <input
                    type={show ? "text" : "password"}
                    placeholder={placeholder}
                    value={pwdForm[key]}
                    onChange={(e) => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                    required
                    className="w-full border-2 border-gray-100 bg-[#fff5f5] rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/30 transition-colors pr-12"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold transition active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="flex-1 bg-gradient-to-r from-[#800000] to-[#6b0000] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition active:scale-[0.98] shadow-lg"
                >
                  {pwdSaving && <Loader2 size={16} className="animate-spin" />}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
