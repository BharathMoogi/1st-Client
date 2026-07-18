"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Trash2, AlertTriangle } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";

type Product = { id: string; name: string; category: string; price: number; stock: number; status: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "products"), orderBy("name")));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }

  async function handleAdd() {
    if (!form.name || !form.price) return;
    setSaving(true);
    const stock = parseInt(form.stock) || 0;
    await addDoc(collection(db, "products"), {
      name: form.name, category: form.category,
      price: parseFloat(form.price), stock,
      status: stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "In Stock",
      createdAt: serverTimestamp(),
    });
    setForm({ name: "", category: "", price: "", stock: "" });
    setModalOpen(false);
    fetchProducts();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "products", id));
    setProducts((p) => p.filter((x) => x.id !== id));
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/8 pb-4 gap-4">
        <div><h1 className="text-2xl font-light tracking-wide">Products</h1><p className="text-xs text-white/40 mt-1">Live supplement catalog from Firestore</p></div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E0B034] text-[#0A0A0A] text-xs font-semibold hover:bg-[#FFE082] transition-colors"><Plus size={14} /> ADD PRODUCT</button>
      </div>
      <div className="bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-72"><Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40" />
        </div>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        {loading ? <div className="py-12 text-center text-white/30 text-xs animate-pulse">Loading…</div>
          : error ? <div className="py-12 text-center text-red-400 text-xs">{error}</div>
          : <div className="overflow-x-auto"><table className="w-full text-left text-xs font-light">
              <thead><tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">PRODUCT</th><th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6 text-right">PRICE</th><th className="py-3.5 px-6 text-right">STOCK</th>
                <th className="py-3.5 px-6">STATUS</th><th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr></thead>
              <tbody>{filtered.length > 0 ? filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/4 hover:bg-white/[0.01]">
                  <td className="py-4 px-6 font-medium text-white">{p.name}</td>
                  <td className="py-4 px-6 text-white/60">{p.category}</td>
                  <td className="py-4 px-6 text-right font-mono text-[#FFE082]">${(p.price||0).toFixed(2)}</td>
                  <td className="py-4 px-6 text-right font-mono"><span className="flex items-center justify-end gap-1.5">{(p.stock||0)<20&&<AlertTriangle size={11} className="text-amber-400"/>}{p.stock??0}</span></td>
                  <td className="py-4 px-6"><span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${p.status==="In Stock"?"bg-green-500/10 text-green-400 border-green-500/20":p.status==="Low Stock"?"bg-amber-500/10 text-amber-400 border-amber-500/20":"bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>{p.status}</span></td>
                  <td className="py-4 px-6 text-right"><button onClick={()=>handleDelete(p.id)} className="p-1 rounded hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors"><Trash2 size={14}/></button></td>
                </tr>)) : <tr><td colSpan={6} className="py-12 text-center text-white/30">No products in Firestore yet.</td></tr>}
              </tbody>
            </table></div>}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/8 rounded-2xl bg-[#090909] p-6 space-y-4">
            <h3 className="text-lg font-light text-[#FFE082]">Add New Product</h3>
            {(["name","category","price","stock"] as const).map((field) => (
              <div key={field}><label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">{field}</label>
                <input value={form[field]} onChange={(e)=>setForm((p)=>({...p,[field]:e.target.value}))} placeholder={`Enter ${field}`} className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"/>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={()=>setModalOpen(false)} className="flex-1 py-2 text-xs border border-white/10 rounded-lg hover:bg-white/4 font-semibold text-white/80">CANCEL</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2 text-xs rounded-lg bg-[#E0B034] text-[#0A0A0A] hover:bg-[#FFE082] font-semibold disabled:opacity-50">{saving?"SAVING…":"SAVE"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
