import { useState, useEffect } from "react";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import { Loader2, Plus, Pencil, Trash2, Check, X, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import Swal from "sweetalert2";

export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/terms/admin/all")
      .then(({ data }) => setTerms(data.terms || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    try {
      await api.post("/terms/admin/add", { text: newText.trim() });
      setNewText("");
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not add term" });
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      await api.put(`/terms/admin/${id}`, { text: editText.trim() });
      setEditId(null);
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not update term" });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (term) => {
    setActionId(term._id);
    try {
      await api.put(`/terms/admin/${term._id}`, { isActive: !term.isActive });
      load();
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id) => {
    const res = await Swal.fire({ title: "Delete this term?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    try {
      await api.delete(`/terms/admin/${id}`);
      load();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f5] font-sans pb-24">
      {/* Header */}
      <div className="bg-[#800000] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Terms & Conditions</h1>
            <p className="text-white/80 font-medium text-sm">Manage policy points</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <Shield className="text-white" size={22} />
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* Add new term */}
        <form onSubmit={add} className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Add New Point</p>
          <div className="flex gap-2">
            <input
              placeholder="Type a new terms point..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1 border-2 border-gray-100 bg-[#fff5f5] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#800000]/30 transition-colors"
            />
            <button
              type="submit"
              disabled={adding || !newText.trim()}
              className="bg-[#800000] text-white px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 active:scale-95 transition shrink-0"
            >
              {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add
            </button>
          </div>
        </form>

        {/* Terms list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={30} className="animate-spin text-[#800000]" />
          </div>
        ) : (
          <div className="space-y-3">
            {terms.length === 0 && (
              <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100">
                <Shield size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No terms added yet</p>
              </div>
            )}
            {terms.map((t, i) => (
              <div key={t._id} className={`bg-white rounded-[24px] border shadow-sm p-4 transition ${!t.isActive ? "opacity-50 border-gray-100" : "border-gray-100"}`}>
                {editId === t._id ? (
                  <div className="flex gap-2 items-start">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="flex-1 border-2 border-[#800000]/30 bg-[#fff5f5] rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => saveEdit(t._id)} disabled={saving} className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center active:scale-95">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button onClick={() => setEditId(null)} className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center active:scale-95">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ffe4e4] text-[#800000] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="flex-1 text-sm text-gray-700 leading-relaxed">{t.text}</p>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => toggle(t)} disabled={actionId === t._id} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${t.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {actionId === t._id ? <Loader2 size={13} className="animate-spin" /> : t.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => { setEditId(t._id); setEditText(t.text); }} className="w-8 h-8 rounded-lg bg-[#ffe4e4] text-[#800000] flex items-center justify-center">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => remove(t._id)} disabled={actionId === t._id} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                        {actionId === t._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
