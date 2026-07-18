"use client";

import React, { useState } from "react";
import { Search, Eye, Filter, CheckCircle, Clock, Truck, XCircle, ArrowRight } from "lucide-react";

const INITIAL_ORDERS = [
  { id: "AW-98315", customer: "Vikram Shah", product: "Gold Standard Whey (1kg)", total: "$69.00", status: "Shipped", date: "July 18, 2026", payment: "UPI / PhonePe", address: "Bandra West, Mumbai" },
  { id: "AW-98314", customer: "Priya Kumar", product: "Micronized Creatine (300g)", total: "$32.00", status: "Delivered", date: "July 17, 2026", payment: "Credit Card", address: "Bandra East, Mumbai" },
  { id: "AW-98313", customer: "Rohan Mehta", product: "Active BCAAs Recover", total: "$29.00", status: "Pending", date: "July 17, 2026", payment: "Net Banking", address: "BKC, Mumbai" },
  { id: "AW-98312", customer: "Deepika R.", product: "Gold Standard Whey (1kg)", total: "$69.00", status: "Delivered", date: "July 16, 2026", payment: "Cash on Delivery", address: "Andheri West, Mumbai" },
  { id: "AW-98311", customer: "Anand Sen", product: "Micronized Creatine (300g)", total: "$32.00", status: "Cancelled", date: "July 15, 2026", payment: "UPI / GPay", address: "Colaba, Mumbai" }
];

export default function OrdersPage() {
  const [orders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState<typeof INITIAL_ORDERS[0] | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.product.toLowerCase().includes(search.toLowerCase());
    
    if (activeFilter === "All") return matchesSearch;
    return matchesSearch && order.status === activeFilter;
  });

  const getStatusStyle = (status: string) => {
    if (status === "Delivered") return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (status === "Shipped") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (status === "Pending") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Orders</h1>
          <p className="text-xs text-white/40 font-light mt-1">Track and manage customer checkout receipts</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01] border border-white/8 p-4 rounded-xl">
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-3 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders, clients..."
            className="w-full bg-white/4 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#E0B034]/40"
          />
        </div>

        {/* Filter status row tabs */}
        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "Shipped", "Delivered", "Cancelled"].map((tab) => {
            const active = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                  active
                    ? "bg-[#E0B034]/10 text-[#E0B034] border border-[#E0B034]/20 font-medium"
                    : "text-white/60 hover:text-white border border-transparent"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order logs table */}
      <div className="rounded-xl border border-white/8 bg-white/[0.01] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.01] text-white/40 tracking-wider">
                <th className="py-3.5 px-6">ORDER ID</th>
                <th className="py-3.5 px-6">CUSTOMER</th>
                <th className="py-3.5 px-6">SUPPLEMENT</th>
                <th className="py-3.5 px-6">TOTAL</th>
                <th className="py-3.5 px-6">PAYMENT</th>
                <th className="py-3.5 px-6">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/4 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#FFE082]">{order.id}</td>
                    <td className="py-4 px-6">{order.customer}</td>
                    <td className="py-4 px-6 text-white/60">{order.product}</td>
                    <td className="py-4 px-6 font-mono">{order.total}</td>
                    <td className="py-4 px-6 text-white/40">{order.payment}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1 rounded hover:bg-white/4 text-[#E0B034] hover:text-[#FFE082] transition-colors inline-flex items-center gap-1.5 text-[10px]"
                      >
                        <Eye size={12} />
                        VIEW DETAILS
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/30 font-light">
                    No matching order receipts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ORDER DETAIL DRAWER SIDE OVERLAY --- */}
      {selectedOrder && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/8 bg-[#090909] shadow-2xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/8 pb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white/50 uppercase">ORDER RECEIPT DETAILS</h3>
                <h4 className="text-xl font-mono text-[#FFE082] mt-0.5">{selectedOrder.id}</h4>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-white/4 text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider block font-semibold">CUSTOMER INFO</span>
                <span className="text-sm font-light text-white block mt-0.5">{selectedOrder.customer}</span>
                <span className="text-xs text-white/55 block font-light">{selectedOrder.address}</span>
              </div>

              <div>
                <span className="text-[10px] text-white/30 uppercase tracking-wider block font-semibold">ITEMS LISTED</span>
                <span className="text-sm font-light text-white block mt-0.5">{selectedOrder.product}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-white/30 uppercase tracking-wider block font-semibold">SUBTOTAL</span>
                  <span className="text-sm font-mono text-[#FFE082] block mt-0.5">{selectedOrder.total}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/30 uppercase tracking-wider block font-semibold">PAYMENT METHOD</span>
                  <span className="text-sm font-light text-white block mt-0.5">{selectedOrder.payment}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/8">
                <span className="text-[10px] text-white/30 uppercase tracking-wider block font-semibold mb-3">DELIVERY TIMELINE</span>
                
                {/* Timeline map */}
                <div className="space-y-4 pl-4 relative border-l border-[#E0B034]/20 ml-2">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#E0B034] border-2 border-[#090909]" />
                    <p className="text-xs font-semibold text-white">Order Placed & Paid</p>
                    <p className="text-[10px] text-white/40">{selectedOrder.date}</p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-[#090909] ${
                      selectedOrder.status !== "Pending" ? "bg-[#E0B034]" : "bg-white/20"
                    }`} />
                    <p className="text-xs font-semibold text-white">Supplement Shipped</p>
                    <p className="text-[10px] text-white/40">Transit hub Bandra Hub</p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-[#090909] ${
                      selectedOrder.status === "Delivered" ? "bg-green-500" : "bg-white/20"
                    }`} />
                    <p className="text-xs font-semibold text-white">Out for Delivery & Received</p>
                    <p className="text-[10px] text-white/40">Verified signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedOrder(null)}
            className="w-full py-2.5 bg-white/4 border border-white/8 text-xs font-semibold rounded-lg hover:bg-white/8 text-white/80 transition-colors"
          >
            DISMISS DRAW
          </button>
        </div>
      )}
    </div>
  );
}
