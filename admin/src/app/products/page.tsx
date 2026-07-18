"use client";

import React, { useState } from "react";
import { Search, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";

const INITIAL_PRODUCTS = [
  { id: "prod-1", name: "Gold Standard Whey Isolate (1kg)", category: "Protein", price: "$69.00", stock: 120, status: "In Stock" },
  { id: "prod-2", name: "Micronized Creatine Powder (300g)", category: "Creatine", price: "$32.00", stock: 85, status: "In Stock" },
  { id: "prod-3", name: "Active BCAAs Recover Matrix (250g)", category: "Amino Acids", price: "$29.00", stock: 4, status: "Low Stock" },
  { id: "prod-4", name: "Daily Multi-Vitamin Active Pack (60 Tab)", category: "Vitamins", price: "$24.00", stock: 240, status: "In Stock" },
  { id: "prod-5", name: "Sleep Support ZMA Night Capsules", category: "Vitamins", price: "$19.00", stock: 0, status: "Out of Stock" }
];

export default function ProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Protein");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  const handleAddProduct = () => {
    if (!newName || !newPrice) return;
    const stockVal = parseInt(newStock) || 0;
    
    const newProd = {
      id: `prod-${Date.now()}`,
      name: newName,
      category: newCategory,
      price: `$${parseFloat(newPrice).toFixed(2)}`,
      stock: stockVal,
      status: stockVal === 0 ? "Out of Stock" : stockVal < 10 ? "Low Stock" : "In Stock",
    };

    setProducts([newProd, ...products]);
    setNewName("");
    setNewPrice("");
    setNewStock("");
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    if (filterCategory === "All") return matchesSearch;
    return matchesSearch && p.category === filterCategory;
  });

  const getStatusBadgeStyle = (status: string) => {
    if (status === "In Stock") return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (status === "Low Stock") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/8 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Products</h1>
          <p className="text-xs text-white/40 font-light mt-1">Manage supplement catalog and listings</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E0B034] text-[#0A0A0A] text-xs font-semibold hover:bg-[#FFE082] transition-colors"
        >
          <Plus size={14} />
          ADD PRODUCT
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplements..."
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-white/40 font-light">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-[#E0B034]/40"
          >
            <option value="All">All Categories</option>
            <option value="Protein">Protein</option>
            <option value="Creatine">Creatine</option>
            <option value="Amino Acids">Amino Acids</option>
            <option value="Vitamins">Vitamins</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">PRODUCT</th>
                <th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6">PRICE</th>
                <th className="py-3.5 px-6">STOCK LEVEL</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{p.name}</td>
                    <td className="py-4 px-6 text-white/50">{p.category}</td>
                    <td className="py-4 px-6 font-mono text-[#FFE082] font-semibold">{p.price}</td>
                    <td className="py-4 px-6 font-mono flex items-center gap-2">
                      {p.stock <= 10 && p.stock > 0 && <AlertTriangle size={12} className="text-amber-400" />}
                      {p.stock} units
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadgeStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button className="p-1 rounded hover:bg-white/4 text-white/50 hover:text-white transition-colors">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/30 font-light">
                    No matching products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/8 rounded-2xl bg-[#090909] p-6 space-y-4">
            <h3 className="text-lg font-light text-[#FFE082] tracking-wide">Add New Product</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Product Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Pure L-Glutamine Amino Acid"
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 rounded-lg px-2 py-2 text-xs text-white/80 focus:outline-none focus:border-[#E0B034]/40"
                  >
                    <option value="Protein">Protein</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Amino Acids">Amino Acids</option>
                    <option value="Vitamins">Vitamins</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Price (USD)</label>
                  <input
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="39.00"
                    type="number"
                    className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Stock Quantity</label>
                <input
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="100"
                  type="number"
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 text-xs border border-white/10 rounded-lg hover:bg-white/4 font-semibold text-white/80 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleAddProduct}
                className="flex-1 py-2 text-xs rounded-lg bg-[#E0B034] text-[#0A0A0A] hover:bg-[#FFE082] font-semibold transition-colors"
              >
                SAVE CATALOG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
