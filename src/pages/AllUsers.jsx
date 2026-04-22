import { useState, useEffect } from "react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import { Search, Users, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/superadmin/users").then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, []);

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
          <div key={u._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-emerald-600 font-extrabold text-base">{u.name?.[0]?.toUpperCase() || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{u.name}</p>
              <p className="text-xs text-gray-400">{u.mobile}</p>
              {u.shopId && <p className="text-xs text-[#800000] font-semibold mt-0.5">Shop: {u.shopId}</p>}
              {u.totalBillAmount > 0 && <p className="text-xs text-blue-600 font-bold mt-0.5">₹{u.totalBillAmount.toLocaleString("en-IN")} total bills</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-extrabold text-emerald-600">{u.walletPoints} pts</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                {u.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
