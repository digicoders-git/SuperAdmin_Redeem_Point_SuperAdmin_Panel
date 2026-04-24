import { useState, useEffect } from "react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import Swal from "sweetalert2";
import { CreditCard, Plus, Pencil, Trash2, X, Check, Loader2, Users, ChevronDown, ChevronUp } from "lucide-react";

const inputCls = "w-full border-2 border-[#ffe4e4] bg-[#fff5f5] rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#800000]/50 transition-colors";
const btnCls = "w-full bg-gradient-to-r from-[#800000] to-[#6b0000] text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition active:scale-[0.98] shadow-lg shadow-[#800000]/20";

const emptyPlan = { name: "", description: "", monthlyPrice: "", annualPrice: "", features: "" };

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [subs, setSubs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [tab, setTab] = useState("plans");
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ adminId: "", planId: "", billingType: "monthly" });
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/subscriptions/plans"),
      api.get("/subscriptions/all"),
      api.get("/superadmin/admins"),
    ]).then(([p, s, a]) => {
      setPlans(p.data.plans || []);
      setSubs(s.data.subscriptions || []);
      setAdmins(a.data.admins || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const savePlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        monthlyPrice: Number(form.monthlyPrice),
        annualPrice: Number(form.annualPrice),
        features: form.features ? form.features.split("\n").map(f => f.trim()).filter(Boolean) : [],
      };
      if (editPlan) {
        await api.put(`/subscriptions/plans/${editPlan._id}`, payload);
      } else {
        await api.post("/subscriptions/plans", payload);
      }
      setShowForm(false); setEditPlan(null); setForm(emptyPlan);
      loadAll();
      Swal.fire({ icon: "success", title: editPlan ? "Plan Updated!" : "Plan Created!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Something went wrong" });
    } finally { setSaving(false); }
  };

  const deletePlan = async (id) => {
    const res = await Swal.fire({ title: "Delete Plan?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete" });
    if (!res.isConfirmed) return;
    await api.delete(`/subscriptions/plans/${id}`);
    loadAll();
  };

  const assign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.post("/subscriptions/assign", assignForm);
      setShowAssign(false);
      setAssignForm({ adminId: "", planId: "", billingType: "trial" });
      loadAll();
      Swal.fire({ icon: "success", title: "Subscription Assigned!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Something went wrong" });
    } finally { setAssigning(false); }
  };

  const cancel = async (id) => {
    const res = await Swal.fire({ title: "Cancel Subscription?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Yes, Cancel" });
    if (!res.isConfirmed) return;
    await api.patch(`/subscriptions/${id}/cancel`);
    loadAll();
  };

  const statusColor = (s) => s === "active" ? "bg-emerald-100 text-emerald-700" : s === "expired" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#800000] to-[#6b0000] rounded-b-[40px] px-6 pt-10 pb-8 mb-6 relative overflow-hidden shadow-lg shadow-[#800000]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Subscriptions</h1>
            <p className="text-white/80 text-sm font-medium">Manage plans & billing</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <CreditCard className="text-white" size={22} />
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-[#ffe4e4] p-1 rounded-2xl mb-5">
          {["plans", "subscriptions"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl capitalize transition ${tab === t ? "bg-[#800000] text-white shadow" : "text-gray-400"}`}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={30} className="animate-spin text-[#800000]" /></div>
        ) : tab === "plans" ? (
          <>
            <button onClick={() => { setShowForm(true); setEditPlan(null); setForm(emptyPlan); }} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#800000]/20 text-[#800000] py-3.5 rounded-2xl font-bold text-sm mb-4 active:scale-[0.98] transition hover:bg-[#fff5f5]">
              <Plus size={17} /> Create New Plan
            </button>

            {plans.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-[#ffe4e4]">
                <CreditCard size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No plans created yet</p>
              </div>
            ) : plans.map(p => (
              <div key={p._id} className="bg-white rounded-2xl border border-[#ffe4e4] p-5 mb-3 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{p.name}</p>
                    {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPlan(p); setForm({ ...p, features: p.features?.join("\n") || "" }); setShowForm(true); }} className="w-8 h-8 bg-[#ffe4e4] text-[#800000] rounded-xl flex items-center justify-center">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deletePlan(p._id)} className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#fff5f5] rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-400">Monthly</p>
                    <p className="font-bold text-[#800000] text-sm">₹{p.monthlyPrice}</p>
                  </div>
                  <div className="bg-[#fff5f5] rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-400">Annual</p>
                    <p className="font-bold text-[#800000] text-sm">₹{p.annualPrice}</p>
                  </div>
                </div>
                {p.features?.length > 0 && (
                  <div className="space-y-1">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <p className="text-xs text-gray-600">{f}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <>
            <button onClick={() => setShowAssign(true)} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#800000]/20 text-[#800000] py-3.5 rounded-2xl font-bold text-sm mb-4 active:scale-[0.98] transition hover:bg-[#fff5f5]">
              <Users size={17} /> Assign Plan to Admin
            </button>

            {subs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-[#ffe4e4]">
                <Users size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No subscriptions yet</p>
              </div>
            ) : subs.map(s => (
              <div key={s._id} className="bg-white rounded-2xl border border-[#ffe4e4] p-4 mb-3 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{s.adminId?.name || s.adminId?.adminId}</p>
                    <p className="text-xs text-gray-400">{s.adminId?.shopId}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusColor(s.status)}`}>{s.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Plan: <span className="font-bold text-gray-800">{s.planId?.name}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}
                      <span className="ml-1 capitalize text-[#800000] font-semibold">({s.billingType})</span>
                    </p>
                  </div>
                  {s.status === "active" && (
                    <button onClick={() => cancel(s._id)} className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-xl font-bold">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Create/Edit Plan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-24 max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="font-extrabold text-gray-900 text-lg">{editPlan ? "Edit Plan" : "Create Plan"}</p>
              <button onClick={() => { setShowForm(false); setEditPlan(null); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={savePlan} className="space-y-3">
              <input placeholder="Plan Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inputCls} />
              <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} />
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Annual Price ₹ *</label>
                <input type="number" placeholder="4999" value={form.annualPrice} onChange={e => setForm({ ...form, annualPrice: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Monthly Price ₹ <span className="text-gray-300 normal-case font-normal">(optional)</span></label>
                <input type="number" placeholder="499" value={form.monthlyPrice} onChange={e => setForm({ ...form, monthlyPrice: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Features (one per line)</label>
                <textarea placeholder={"Unlimited users\nBill uploads\nRewards catalog"} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={4} className={inputCls + " resize-none"} />
              </div>
              <div className="sticky bottom-0 bg-white pt-3">
                <button type="submit" disabled={saving} className={btnCls}>{saving && <Loader2 size={15} className="animate-spin" />}{editPlan ? "Update Plan" : "Create Plan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subscription Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center mb-20">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-8">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <p className="font-extrabold text-gray-900 text-lg">Assign Plan</p>
              <button onClick={() => setShowAssign(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={assign} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Select Admin</label>
                <select value={assignForm.adminId} onChange={e => setAssignForm({ ...assignForm, adminId: e.target.value })} required className={inputCls}>
                  <option value="">Choose admin...</option>
                  {admins.map(a => <option key={a._id} value={a._id}>{a.name || a.adminId} — {a.shopId}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Select Plan</label>
                <select value={assignForm.planId} onChange={e => setAssignForm({ ...assignForm, planId: e.target.value })} required className={inputCls}>
                  <option value="">Choose plan...</option>
                  {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 block">Billing Type</label>
                <select value={assignForm.billingType} onChange={e => setAssignForm({ ...assignForm, billingType: e.target.value })} className={inputCls}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <button type="submit" disabled={assigning} className={btnCls}>{assigning && <Loader2 size={15} className="animate-spin" />} Assign Plan</button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
