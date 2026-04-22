import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axios";
import Swal from "sweetalert2";
import BottomNav from "../components/BottomNav";
import { Plus, Trash2, QrCode, X, Download, ChevronRight, Users, Receipt, Store } from "lucide-react";
import * as XLSX from "xlsx";

const USER_PANEL_URL = import.meta.env.VITE_USER_PANEL_URL || "https://your-userpanel.vercel.app";

export default function Admins() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [qrAdmin, setQrAdmin] = useState(null);
  const [form, setForm] = useState({ adminId: "", password: "", name: "" });
  const [creating, setCreating] = useState(false);
  const qrRef = useRef(null);

  const fetchAdmins = () => {
    setLoading(true);
    api.get("/superadmin/admins").then(({ data }) => setAdmins(data.admins)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const createAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/superadmin/admins", form);
      setForm({ adminId: "", password: "", name: "" });
      setShowCreate(false);
      fetchAdmins();
      Swal.fire({ icon: "success", title: "Admin Created!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed" });
    } finally {
      setCreating(false);
    }
  };

  const deleteAdmin = async (id, name) => {
    const result = await Swal.fire({
      icon: "warning", title: "Delete Admin?",
      text: `Delete "${name}"? This cannot be undone.`,
      showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/superadmin/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed" });
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${qrAdmin.shopId}-qr.png`;
    a.click();
  };

  const exportToExcel = () => {
    const data = admins.map((a) => ({
      Name: a.name || "N/A",
      "Admin ID": a.adminId,
      "Shop ID": a.shopId,
      "User Count": a.userCount || 0,
      "Bill Count": a.billCount || 0,
      "Created On": new Date(a.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admins");
    XLSX.writeFile(wb, `Admins_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] pb-24">
      {/* Header */}
      <div className="bg-[#800000] px-6 pt-10 pb-8 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-2xl tracking-wide mb-1">Manage Admins</p>
            <p className="text-white/80 font-medium text-sm">{admins.length} admins registered</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              disabled={admins.length === 0}
              className="flex items-center gap-1.5 bg-white/10 text-white text-sm font-bold px-3 py-2.5 rounded-2xl border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-[#f97316] text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-[0_5px_15px_rgba(249,115,22,0.3)]"
            >
              <Plus size={16} /> New Admin
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3">
        {loading ? (
          <div className="space-y-3 animate-in fade-in duration-500">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-11 h-11 bg-gray-100 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-100 rounded-lg" />
                      <div className="h-3 w-24 bg-gray-50 rounded-full" />
                      <div className="h-3 w-20 bg-gray-50 rounded-full" />
                      <div className="flex gap-3 pt-1">
                        <div className="h-3 w-16 bg-gray-50 rounded-full" />
                        <div className="h-3 w-16 bg-gray-50 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-gray-50 rounded-xl" />
                    <div className="h-9 w-9 bg-gray-50 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-16 h-16 bg-[#ffe4e4] rounded-2xl flex items-center justify-center">
              <Store size={28} className="text-[#800000]" />
            </div>
            <p className="text-gray-400 text-sm">No admins found</p>
          </div>
        ) : admins.map((a) => (
          <div key={a._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => navigate(`/admins/${a._id}`)}>
                <div className="w-11 h-11 bg-[#ffe4e4] rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-[#800000] font-extrabold text-base">{(a.name || a.adminId)[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-gray-900 text-sm">{a.name || a.adminId}</p>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">ID: {a.adminId}</p>
                  <p className="text-xs text-[#800000] font-semibold mt-0.5">Shop: {a.shopId}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={11} />{a.userCount} users</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Receipt size={11} />{a.billCount} bills</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQrAdmin(a)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#ffe4e4] text-[#800000]">
                  <QrCode size={17} />
                </button>
                <button onClick={() => deleteAdmin(a._id, a.name || a.adminId)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Admin Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-8">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="font-extrabold text-gray-900 text-lg">Create New Admin</p>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={createAdmin} className="space-y-3">
              {[
                { key: "name", placeholder: "Full Name (optional)" },
                { key: "adminId", placeholder: "Admin ID *", required: true },
                { key: "password", placeholder: "Password *", type: "password", required: true },
              ].map(({ key, placeholder, type, required }) => (
                <input
                  key={key}
                  type={type || "text"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#800000]/40 transition"
                />
              ))}
              <button type="submit" disabled={creating} className="w-full bg-[#800000] hover:bg-[#6b0000] text-white font-extrabold py-3.5 rounded-2xl mt-1 transition active:scale-[0.98]">
                {creating ? "Creating..." : "Create Admin"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-extrabold text-gray-900">Shop QR Code</p>
              <button onClick={() => setQrAdmin(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-[#ffe4e4] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-[#800000] font-extrabold text-2xl">{(qrAdmin.name || qrAdmin.adminId)[0].toUpperCase()}</span>
              </div>
              <p className="font-bold text-gray-800">{qrAdmin.name || qrAdmin.adminId}</p>
              <p className="text-xs text-[#800000] font-semibold mt-0.5">Shop: {qrAdmin.shopId}</p>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-2xl p-4 mb-4" ref={qrRef}>
              <QRCodeCanvas
                value={`${USER_PANEL_URL}/register?shopId=${qrAdmin.shopId}`}
                size={180}
                bgColor="#f9fafb"
                fgColor="#1a0000"
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-gray-400 text-center mb-4 break-all">{USER_PANEL_URL}/register?shopId={qrAdmin.shopId}</p>
            <button onClick={downloadQR} className="w-full bg-[#800000] text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2">
              <Download size={16} /> Download QR
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
