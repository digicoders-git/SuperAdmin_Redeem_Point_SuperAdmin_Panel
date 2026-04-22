import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import { Users, Store, Gift, Receipt, RotateCcw, Zap, LogOut, LayoutDashboard, Clock, Loader2, Settings } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div onClick={onClick} className={`rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center text-center bg-white border ${color} cursor-pointer active:scale-[0.97] transition-transform`}>
    <div className={`mb-3 w-12 h-12 rounded-2xl flex items-center justify-center ${color.split(" ")[0]}`}>
      {icon}
    </div>
    <div className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{value ?? "—"}</div>
    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ growth: [], owners: [] });
  const saInfo = JSON.parse(localStorage.getItem("saInfo") || "{}");

  useEffect(() => {
    Promise.all([
      api.get("/superadmin/dashboard"),
      api.get("/superadmin/users"),
      api.get("/superadmin/admins"),
    ]).then(([d, u, a]) => {
      setStats(d.data);
      const users = u.data.users || [];
      const admins = a.data.admins || [];

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push({ date: d, name: days[d.getDay()] });
      }

      const growthData = last7Days.map(day => {
        const endOfDay = new Date(day.date);
        endOfDay.setHours(23, 59, 59, 999);
        const count = users.filter(u => new Date(u.createdAt) <= endOfDay).length;
        return { name: day.name, value: count };
      });

      const ownersData = last7Days.map(day => {
        const count = admins.filter(a => {
          const ad = new Date(a.createdAt);
          return ad.toDateString() === day.date.toDateString();
        }).length;
        return { name: day.name, value: count };
      });

      setChartData({ growth: growthData, owners: ownersData });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("saToken");
    localStorage.removeItem("saInfo");
    navigate("/", { replace: true });
  };

  const cards = [
    { label: "Total Admins", value: stats?.totalAdmins, icon: <Store size={24} />, color: "bg-[#800000]/10 text-[#800000] border-[#800000]/20", path: "/admins" },
    { label: "Total Users", value: stats?.totalUsers, icon: <Users size={24} />, color: "bg-emerald-100 text-emerald-600 border-emerald-200", path: "/users" },
    { label: "Total Bills", value: stats?.totalBills, icon: <Receipt size={24} />, color: "bg-[#6b0000]/10 text-[#6b0000] border-[#6b0000]/20", path: "/admins" },
    { label: "Total Rewards", value: stats?.totalRewards, icon: <Gift size={24} />, color: "bg-[#800000]/10 text-[#800000] border-[#800000]/20", path: "/rewards" },
    { label: "Pending Bills", value: stats?.pendingBills, icon: <Clock size={24} />, color: "bg-amber-100 text-amber-600 border-amber-200", path: "/admins" },
    { label: "Pending Redeem", value: stats?.pendingRedemptions, icon: <RotateCcw size={24} />, color: "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20", path: "/admins" },
    { label: "Points Issued", value: stats?.totalPointsIssued, icon: <Zap size={24} />, color: "bg-[#800000]/10 text-[#800000] border-[#800000]/20", path: "/users" },
    { label: "System Settings", value: "⚙️", icon: <Settings size={24} />, color: "bg-blue-100 text-blue-600 border-blue-200", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      {/* Header */}
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Dashboard</h1>
            <p className="text-white/80 font-medium text-sm">Welcome, {saInfo.username || "Super Admin"}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <LayoutDashboard className="text-white" size={22} />
            </div>
            <button onClick={logout} className="bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-2.5 rounded-2xl flex items-center gap-1.5">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="animate-in fade-in duration-500">
            {/* Stat Cards Skeleton */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-3 mx-auto" />
                  <div className="h-6 w-12 bg-gray-100 rounded-lg mb-2 mx-auto" />
                  <div className="h-3 w-16 bg-gray-50 rounded-full mx-auto" />
                </div>
              ))}
            </div>

            {/* Chart Skeletons */}
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-[32px] p-6 mb-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex justify-between mb-6">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-3 w-24 bg-gray-50 rounded-full" />
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-8 w-12 bg-gray-100 rounded-lg ml-auto" />
                    <div className="h-2 w-16 bg-gray-50 rounded-full" />
                  </div>
                </div>
                <div className="h-[200px] w-full bg-gray-50 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {cards.map((c) => (
                <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value} color={c.color} onClick={() => navigate(c.path)} />
              ))}
            </div>

            {/* Customer Growth Chart */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 mb-6">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-gray-900 font-bold text-lg">Customer Growth</h3>
                  <p className="text-gray-400 text-xs font-medium">Total customers over last 7 days</p>
                </div>
                <div className="text-right">
                  <span className="text-[#800000] font-black text-3xl leading-none">{stats?.totalUsers || 0}</span>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">total customers</p>
                </div>
              </div>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrowthSA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#800000" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} itemStyle={{ color: '#800000', fontWeight: 700 }} />
                    <Line type="monotone" dataKey="value" stroke="#800000" strokeWidth={3} dot={{ r: 4, fill: '#800000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Shop Owners Chart */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 mb-6">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-gray-900 font-bold text-lg">Shop Owners</h3>
                  <p className="text-gray-400 text-xs font-medium">New admins registered last 7 days</p>
                </div>
                <div className="text-right">
                  <span className="text-[#800000] font-black text-3xl leading-none">{stats?.totalAdmins || 0}</span>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">total owners</p>
                </div>
              </div>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.owners} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOwners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#800000" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }} itemStyle={{ color: '#800000', fontWeight: 700 }} />
                    <Area type="monotone" dataKey="value" stroke="#800000" strokeWidth={3} fillOpacity={1} fill="url(#colorOwners)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
