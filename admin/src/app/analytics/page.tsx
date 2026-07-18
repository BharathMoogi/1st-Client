"use client";

import React, { useState } from "react";
import { TrendingUp, BarChart2, PieChart, Calendar, RefreshCw } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Last 6 Months");

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/8 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Analytics</h1>
          <p className="text-xs text-white/40 font-light mt-1">Detailed statistical insights and sales conversions</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-white/40" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/4 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-[#E0B034]/40"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Year to Date">Year to Date</option>
          </select>
        </div>
      </div>

      {/* --- CHARTS GRID (PREMIUM SVG GRAPHS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Conversion Bar Chart */}
        <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/8 pb-3">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082]">Checkout Order Volumes</h3>
            <span className="text-[10px] text-white/40 font-light">{timeRange.toUpperCase()}</span>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-64 w-full flex items-end">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(255,255,255,0.06)" />

              {/* Bar columns */}
              {/* Feb */}
              <rect x="35" y="110" width="30" height="80" rx="3" fill="#E0B034" opacity="0.8" />
              {/* Mar */}
              <rect x="115" y="90" width="30" height="100" rx="3" fill="#FFE082" opacity="0.9" />
              {/* Apr */}
              <rect x="195" y="60" width="30" height="130" rx="3" fill="#E0B034" opacity="0.85" />
              {/* May */}
              <rect x="275" y="70" width="30" height="120" rx="3" fill="#FFE082" opacity="0.9" />
              {/* Jun */}
              <rect x="355" y="40" width="30" height="150" rx="3" fill="#E0B034" opacity="0.8" />
              {/* Jul */}
              <rect x="435" y="25" width="30" height="165" rx="3" fill="#FFE082" opacity="0.95" />
            </svg>
          </div>
          {/* Label rows */}
          <div className="flex justify-between text-[9px] text-white/30 tracking-widest font-light px-6">
            <span>FEB (180)</span>
            <span>MAR (220)</span>
            <span>APR (280)</span>
            <span>MAY (260)</span>
            <span>JUN (340)</span>
            <span>JUL (380)</span>
          </div>
        </div>

        {/* Average Order Value Conversion (Line Graph) */}
        <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/8 pb-3">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082]">Average Ticket Value</h3>
            <span className="text-[10px] text-white/40 font-light">USD METRIC</span>
          </div>

          <div className="h-64 w-full flex items-end">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(255,255,255,0.06)" />

              {/* Line path */}
              <path
                d="M 50 120 L 130 110 L 210 130 L 290 80 L 370 70 L 450 45"
                fill="none"
                stroke="#E0B034"
                strokeWidth="2"
              />
              <circle cx="50" cy="120" r="3.5" fill="#FFE082" />
              <circle cx="130" cy="110" r="3.5" fill="#FFE082" />
              <circle cx="210" cy="130" r="3.5" fill="#FFE082" />
              <circle cx="290" cy="80" r="3.5" fill="#FFE082" />
              <circle cx="370" cy="70" r="3.5" fill="#FFE082" />
              <circle cx="450" cy="45" r="3.5" fill="#FFE082" />
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-white/30 tracking-widest font-light px-6">
            <span>FEB ($42)</span>
            <span>MAR ($45)</span>
            <span>APR ($39)</span>
            <span>MAY ($58)</span>
            <span>JUN ($62)</span>
            <span>JUL ($69)</span>
          </div>
        </div>
      </div>

      {/* --- PAYMENT CONVERSIONS & TRAFFIC --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
          <h3 className="text-sm font-semibold tracking-wide text-[#FFE082] border-b border-white/8 pb-3">Payment Channel Breakdown</h3>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-light mb-1">
                <span>UPI / Instant Netbanking</span>
                <span className="text-[#FFE082] font-semibold">68% ($96,900)</span>
              </div>
              <div className="w-full h-2 bg-white/4 rounded-full overflow-hidden">
                <div className="h-full bg-[#E0B034] rounded-full" style={{ width: "68%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-light mb-1">
                <span>Credit / Debit Cards</span>
                <span className="text-[#FFE082] font-semibold">22% ($31,350)</span>
              </div>
              <div className="w-full h-2 bg-white/4 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFE082] rounded-full" style={{ width: "22%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-light mb-1">
                <span>Cash on Delivery (COD)</span>
                <span className="text-[#FFE082] font-semibold">10% ($14,250)</span>
              </div>
              <div className="w-full h-2 bg-white/4 rounded-full overflow-hidden">
                <div className="h-full bg-white/20 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Conversions summary */}
        <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-[#FFE082] border-b border-white/8 pb-3">Conversion Rates</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-white/40 font-light block">Cart-to-Checkout Conversion</span>
              <span className="text-3xl font-light text-[#FFE082] mt-1 block">4.2%</span>
            </div>
            <div>
              <span className="text-xs text-white/40 font-light block">Repeat Purchase Rate</span>
              <span className="text-3xl font-light text-[#FFE082] mt-1 block">34.8%</span>
            </div>
          </div>
          <button className="w-full py-2 bg-white/4 border border-white/8 text-[11px] font-semibold rounded-lg hover:bg-white/8 text-white/80 transition-colors inline-flex items-center justify-center gap-1.5 uppercase">
            <RefreshCw size={12} />
            Recalculate Model
          </button>
        </div>
      </div>
    </div>
  );
}
