import { useState, useEffect } from "react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import { Search, Users, Download, ChevronDown, ChevronUp, Receipt, IndianRupee, Clock, FileText, X, ZoomIn } from "lucide-react";
import * as XLSX from "xlsx";

const statusStyle = {
  pending: "bg-amber-100 text-amber-600",
  approved: "bg-green-100 text-green-600",
  rejected: "bg-red-100 text-red-500",
};

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userBills, setUserBills] = useState({});
  const [loadingBills, setLoadingBills] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const serverBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "";
  const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${serverBase}/${cleanPath}`;
  };

  const downloadImage = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    api.get("/superadmin/users").then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    if (userBills[userId]) return;
    setLoadingBills(userId);
    try {
      const { data } = await api.get("/superadmin/bills");
      // group bills by userId
      const grouped = {};
      data.bills.forEach(b => {
        const uid = b.userId?._id || b.userId;
        if (!grouped[uid]) grouped[uid] = [];
        grouped[uid].push(b);
      });
      setUserBills(prev => ({ ...prev, ...grouped }));
    } catch (_) {}
    finally { setLoadingBills(null); }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.includes(search) ||
    u.shopId?.toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = () => {
    const data = filtered.map((u) => ({
      Name: u.name,
      Mobile: u.mobile,
      "Shop ID": u.shopId || "N/A",
      "Wallet Points": u.walletPoints || 0,
      "Total Purchase": u.totalBillAmount || 0,
      Status: u.isActive ? "Active" : "Inactive",
      "Registered On": new Date(u.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `AllUsers_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] pb-24">
      {/* Header */}
      <div className="bg-[#800000] px-6 pt-10 pb-8 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-2xl tracking-wide mb-1">All Users</p>
              <p className="text-white/80 font-medium text-sm">{users.length} registered users</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                disabled={filtered.length === 0}
                className="bg-white/10 p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
              >
                <Download size={20} className="text-white" />
              </button>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <Users size={22} className="text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center bg-white/10 border border-white/20 rounded-2xl px-4 py-3 gap-2">
            <Search size={16} className="text-white/60" />
            <input
              placeholder="Search name, mobile, shop ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full text-sm text-white placeholder-white/50 outline-none font-medium"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-2">
        {loading ? (
          <div className="space-y-2 animate-in fade-in duration-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded-lg" />
                  <div className="h-3 w-24 bg-gray-50 rounded-full" />
                  <div className="h-3 w-20 bg-gray-50 rounded-full" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-12 bg-gray-100 rounded-lg ml-auto" />
                  <div className="h-5 w-16 bg-gray-50 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Users size={28} className="text-emerald-300" />
            </div>
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        ) : filtered.map((u) => (
          <div key={u._id}>
            <div
              onClick={() => toggleUser(u._id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-emerald-600 font-extrabold text-base">{u.name?.[0]?.toUpperCase() || "U"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-400">{u.mobile}</p>
                {u.shopId && <p className="text-xs text-[#800000] font-semibold mt-0.5">Shop: {u.shopId}</p>}
                {u.totalBillAmount > 0 && <p className="text-xs text-blue-600 font-bold mt-0.5">₹{u.totalBillAmount.toLocaleString("en-IN")} total bills</p>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <p className="text-sm font-extrabold text-emerald-600">{u.walletPoints} pts</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                  {u.isActive ? "Active" : "Inactive"}
                </span>
                {expandedUser === u._id ? <ChevronUp size={14} className="text-gray-400 mt-1" /> : <ChevronDown size={14} className="text-gray-400 mt-1" />}
              </div>
            </div>

            {/* Bills Dropdown */}
            {expandedUser === u._id && (
              <div className="mx-2 mb-2 bg-gray-50 rounded-b-2xl border border-t-0 border-gray-100 px-3 pb-3 pt-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Receipt size={12} /> Bills
                </p>
                {loadingBills === u._id ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-[#800000] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !userBills[u._id] || userBills[u._id].length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No bills found</p>
                ) : (
                  <div className="space-y-3">
                    {userBills[u._id].map(b => {
                      const isPdf = b.billImage?.toLowerCase().includes(".pdf");
                      return (
                        <div key={b._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          {/* Bill Info Row */}
                          <div className="px-3 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IndianRupee size={14} className="text-[#800000] shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-gray-800">₹{b.amount}</p>
                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Clock size={9} /> {new Date(b.createdAt).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                              {b.pointsEarned > 0 && <span className="text-[10px] text-emerald-600 font-bold">+{b.pointsEarned} pts</span>}
                            </div>
                          </div>
                          {/* Bill Image */}
                          {b.billImage && (
                            <div className="px-3 pb-3">
                              {isPdf ? (
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-red-400" />
                                    <span className="text-xs font-semibold text-gray-600">PDF Document</span>
                                  </div>
                                  <button
                                    onClick={() => downloadImage(getFullUrl(b.billImage), `bill-${b._id}.pdf`)}
                                    className="flex items-center gap-1 bg-[#800000] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95"
                                  >
                                    <Download size={11} /> Download
                                  </button>
                                </div>
                              ) : (
                                <div className="relative group">
                                  <img
                                    src={getFullUrl(b.billImage)}
                                    alt="bill"
                                    className="w-full h-32 object-cover rounded-xl border border-gray-100 cursor-zoom-in"
                                    onClick={() => setFullScreenImage(getFullUrl(b.billImage))}
                                    onError={(e) => { e.target.style.display = "none"; }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all flex items-center justify-center pointer-events-none">
                                    <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                                  </div>
                                  <button
                                    onClick={() => downloadImage(getFullUrl(b.billImage), `bill-${b._id}.jpg`)}
                                    className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#800000] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow active:scale-95"
                                  >
                                    <Download size={11} /> Download
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav />

      {/* Fullscreen Image Viewer */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" onClick={() => setFullScreenImage(null)}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-white/70 text-sm font-medium">Bill Image</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadImage(fullScreenImage, `bill-${Date.now()}.jpg`)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
              >
                <Download size={14} /> Download
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition" onClick={() => setFullScreenImage(null)}>
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img src={fullScreenImage} alt="Bill" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          </div>
          <p className="text-white/30 text-xs text-center pb-4 shrink-0">Tap outside to close</p>
        </div>
      )}
    </div>
  );
}
