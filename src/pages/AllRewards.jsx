import { useState, useEffect } from "react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import { Gift, Search, X, Download } from "lucide-react";
import * as XLSX from "xlsx";

export default function AllRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.get("/superadmin/rewards").then(({ data }) => setRewards(data.rewards)).finally(() => setLoading(false));
  }, []);

  const filteredRewards = rewards.filter((r) => {
    const query = searchQuery.toLowerCase();
    const shopId = r.adminId?.shopId?.toLowerCase() || "";
    const ownerName = r.adminId?.name?.toLowerCase() || "";
    const adminId = r.adminId?.adminId?.toLowerCase() || "";
    const rewardName = r.rewardName?.toLowerCase() || "";
    
    return shopId.includes(query) || ownerName.includes(query) || adminId.includes(query) || rewardName.includes(query);
  });

  const exportToExcel = () => {
    const data = filteredRewards.map((r) => ({
      "Reward Name": r.rewardName,
      Description: r.description || "N/A",
      "Points Required": r.pointsRequired,
      "Admin Name": r.adminId?.name || "N/A",
      "Admin ID": r.adminId?.adminId || "N/A",
      "Shop ID": r.adminId?.shopId || "N/A",
      Status: r.isActive ? "Active" : "Inactive",
      "Created On": new Date(r.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rewards");
    XLSX.writeFile(wb, `AllRewards_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] pb-24">
      {/* Header */}
      <div className="bg-[#800000] px-6 pt-10 pb-8 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-bold text-2xl tracking-wide mb-1">All Rewards</p>
              <p className="text-white/80 font-medium text-sm">{filteredRewards.length} of {rewards.length} rewards</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                disabled={filteredRewards.length === 0}
                className="bg-white/10 p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
              >
                <Download size={20} className="text-white" />
              </button>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <Gift size={22} className="text-white" />
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search by shop ID, owner name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-11 py-3 text-white placeholder:text-white/50 text-sm font-medium focus:outline-none focus:bg-white/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3">
        {loading ? (
          <div className="space-y-3 animate-in fade-in duration-500">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded-lg" />
                  <div className="h-3 w-48 bg-gray-50 rounded-lg" />
                  <div className="h-3 w-24 bg-gray-50 rounded-full" />
                  <div className="h-5 w-16 bg-gray-50 rounded-full" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-5 w-12 bg-gray-100 rounded-lg ml-auto" />
                  <div className="h-3 w-8 bg-gray-50 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-16 h-16 bg-[#ffe4e4] rounded-2xl flex items-center justify-center">
              {searchQuery ? <Search size={28} className="text-[#800000]" /> : <Gift size={28} className="text-[#800000]" />}
            </div>
            <p className="text-gray-400 text-sm">{searchQuery ? "No rewards found matching your search" : "No rewards found"}</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#800000] text-sm font-bold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : filteredRewards.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            {r.rewardImage ? (
              <img src={r.rewardImage} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 bg-[#ffe4e4] rounded-2xl flex items-center justify-center shrink-0">
                <Gift size={22} className="text-[#800000]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{r.rewardName}</p>
              {r.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description}</p>}
              <p className="text-xs text-[#800000] font-semibold mt-1">
                {r.adminId ? `${r.adminId.name || r.adminId.adminId} · ${r.adminId.shopId}` : "No admin assigned"}
              </p>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${r.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                {r.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-extrabold text-[#800000]">{r.pointsRequired}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
