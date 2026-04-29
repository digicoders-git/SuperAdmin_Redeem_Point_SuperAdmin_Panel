import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Users, Gift, RotateCcw, QrCode, Download, X, Receipt, ZoomIn, IndianRupee, FileText } from "lucide-react";

const USER_PANEL_URL = import.meta.env.VITE_USER_PANEL_URL || "https://super-admin-redeem-point-admin-pane.vercel.app/";

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 text-sm font-extrabold rounded-2xl transition ${active ? "bg-[#800000] text-white shadow" : "text-gray-400 bg-transparent"}`}
  >
    {label}
  </button>
);

export default function AdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("users");
  const [showQR, setShowQR] = useState(false);
  const [imgModal, setImgModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBills, setUserBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    api.get(`/superadmin/admins/${id}`).then(({ data }) => setData(data)).catch(() => navigate("/admins"));
  }, [id]);

  const fetchUserBills = async (user) => {
    setSelectedUser(user);
    setLoadingBills(true);
    try {
      const { data } = await api.get(`/superadmin/users/${user._id}/bills`);
      setUserBills(data.bills);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBills(false);
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${data.admin.shopId}-qr.png`;
    a.click();
  };

  const serverBase = import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "";
  const getFullUrl = (path) => {
    if (!path || path === "manual_adjustment") return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${serverBase}/${cleanPath}`;
  };

  if (!data) return (
    <div className="min-h-screen bg-[#fff5f5] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#ffe4e4] border-t-[#800000] rounded-full animate-spin" />
    </div>
  );

  const { admin, users, bills, rewards, redemptions } = data;

  return (
    <div className="min-h-screen bg-[#fff5f5] pb-24">
      {/* Header */}
      <div className="bg-[#800000] px-6 pt-10 pb-8 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate("/admins")} className="w-9 h-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex-1">
              <p className="text-white font-bold text-xl leading-tight">{admin.name || admin.adminId}</p>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{admin.shopName || "N/A"}</p>
              <p className="text-white/50 text-[10px] font-medium">Shop ID: {admin.shopId}</p>
              <p className="text-white/50 text-[10px] font-medium">Mobile: {admin.mobile || "N/A"}</p>
            </div>
            <button onClick={() => setShowQR(true)} className="flex items-center gap-1.5 bg-[#f97316] text-white text-xs font-bold px-3 py-2 rounded-xl">
              <QrCode size={14} /> QR Code
            </button>
          </div>
          <div className="flex gap-3">
            {[
              { icon: Users, label: "Users", val: users.length },
              { icon: Gift, label: "Rewards", val: rewards.length },
              { icon: RotateCcw, label: "Redemptions", val: redemptions.length },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-3 py-3 text-center">
                <Icon size={16} className="text-white/60 mx-auto mb-1" />
                <p className="text-white font-bold text-lg leading-tight">{val}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl mb-4">
          <Tab label="Users" active={tab === "users"} onClick={() => setTab("users")} />
          <Tab label="Bills" active={tab === "bills"} onClick={() => setTab("bills")} />
          <Tab label="Rewards" active={tab === "rewards"} onClick={() => setTab("rewards")} />
          <Tab label="Redemptions" active={tab === "redemptions"} onClick={() => setTab("redemptions")} />
        </div>

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Users size={28} className="text-gray-200" />
                <p className="text-gray-400 text-sm">No users yet</p>
              </div>
            ) : users.map((u) => (
              <div key={u._id} onClick={() => fetchUserBills(u)} className="bg-white rounded-2xl p-3.5 border border-gray-100 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 font-extrabold">{u.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#800000]">{u.walletPoints} pts</p>
                  <span className={`text-xs font-bold ${u.isActive ? "text-emerald-500" : "text-red-400"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bills Tab */}
        {tab === "bills" && (
          <div className="space-y-3">
            {bills.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Receipt size={28} className="text-gray-200" />
                <p className="text-gray-400 text-sm">No bills found</p>
              </div>
            ) : bills.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#800000]/10 rounded-xl flex items-center justify-center">
                      <Receipt size={18} className="text-[#800000]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="font-extrabold text-gray-900">₹{b.amount}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    b.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    b.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>{b.status}</span>
                </div>
                {b.billImage && b.billImage !== "manual_adjustment" && (
                  <div className="relative group cursor-zoom-in mt-2" onClick={() => setImgModal(getFullUrl(b.billImage))}>
                    <img src={getFullUrl(b.billImage)} alt="Bill" className="w-full h-40 object-cover rounded-xl border border-gray-100 shadow-sm" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all flex items-center justify-center">
                      <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                   <div>
                     <p className="text-[10px] text-gray-400 font-bold uppercase">Points Earned</p>
                     <p className="text-sm font-black text-emerald-600">+{b.pointsEarned || 0} pts</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-gray-400 font-bold uppercase">User ID</p>
                     <p className="text-[10px] font-bold text-gray-700 truncate max-w-[100px]">{b.userId || "—"}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Rewards Tab */}
        {tab === "rewards" && (
          <div className="space-y-2">
            {rewards.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Gift size={28} className="text-gray-200" />
                <p className="text-gray-400 text-sm">No rewards yet</p>
              </div>
            ) : rewards.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl p-3.5 border border-gray-100 flex items-center gap-3">
                {r.rewardImage ? (
                  <div className="relative group cursor-zoom-in shrink-0" onClick={() => setImgModal(getFullUrl(r.rewardImage))}>
                    <img src={getFullUrl(r.rewardImage)} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-all flex items-center justify-center">
                      <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-[#ffe4e4] rounded-xl flex items-center justify-center shrink-0">
                    <Gift size={18} className="text-[#800000]" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{r.rewardName}</p>
                  {r.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#800000]">{r.pointsRequired} pts</p>
                  <span className={`text-xs font-bold ${r.isActive ? "text-emerald-500" : "text-red-400"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Redemptions Tab */}
        {tab === "redemptions" && (
          <div className="space-y-2">
            {redemptions.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <RotateCcw size={28} className="text-gray-200" />
                <p className="text-gray-400 text-sm">No redemptions yet</p>
              </div>
            ) : redemptions.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Receipt size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{r.userId?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{r.rewardId?.rewardName || "—"}</p>
                  </div>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  r.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                  r.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imgModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" onClick={() => setImgModal(null)}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/70 text-sm font-medium">Image Preview</span>
            <button className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white transition-colors" onClick={() => setImgModal(null)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img src={imgModal} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
          <p className="text-white/30 text-xs text-center pb-4 shrink-0">Tap outside to close</p>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-extrabold text-gray-900">Shop QR Code</p>
              <button onClick={() => setShowQR(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="text-center mb-3">
              <p className="font-bold text-gray-800">{admin.name || admin.adminId}</p>
              <p className="text-xs text-[#800000] font-semibold">Shop: {admin.shopId}</p>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-2xl p-4 mb-3" ref={qrRef}>
              <QRCodeCanvas
                value={`${USER_PANEL_URL}/user/login?shopId=${admin.shopId}`}
                size={180}
                bgColor="#f9fafb"
                fgColor="#1a0000"
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-gray-400 text-center mb-4 break-all">{USER_PANEL_URL}/user/login?shopId={admin.shopId}</p>
            <button onClick={downloadQR} className="w-full bg-[#800000] text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2">
              <Download size={16} /> Download QR
            </button>
          </div>
        </div>
      )}

      {/* User Bills Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-[#800000] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{selectedUser.name}'s Bills</h3>
                <p className="text-white/60 text-xs">Total {userBills.length} uploads</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {loadingBills ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#ffe4e4] border-t-[#800000] rounded-full animate-spin" />
                </div>
              ) : userBills.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2">
                  <FileText size={32} className="text-gray-200" />
                  <p className="text-gray-400 text-sm font-medium">No bills uploaded yet</p>
                </div>
              ) : (
                userBills.map((b) => (
                  <div key={b._id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#800000]/10 rounded-xl flex items-center justify-center">
                          <Receipt size={18} className="text-[#800000]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="font-extrabold text-gray-900">₹{b.amount}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        b.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        b.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>{b.status}</span>
                    </div>
                    {b.billImage && b.billImage !== "manual_adjustment" && (
                      <div className="relative group cursor-zoom-in mt-2" onClick={() => setImgModal(getFullUrl(b.billImage))}>
                        <img src={getFullUrl(b.billImage)} alt="Bill" className="w-full h-32 object-cover rounded-xl border border-gray-200 shadow-sm" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all flex items-center justify-center">
                          <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-200/50 flex justify-between items-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Points Earned</p>
                      <p className="text-sm font-black text-emerald-600">+{b.pointsEarned || 0} pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setSelectedUser(null)} className="w-full py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm active:scale-95 transition">Close</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

    </div>
  );
}
