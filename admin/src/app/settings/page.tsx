"use client";

import React, { useState } from "react";
import { Save, Settings as SettingsIcon, Shield, Server, Bell, Globe } from "lucide-react";

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("Aurum Wellness");
  const [currency, setCurrency] = useState("USD");
  const [maintenance, setMaintenance] = useState(false);
  const [signups, setSignups] = useState(true);
  const [apiKey, setApiKey] = useState("sk_live_51Ny98H289A2k1883F...");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Settings</h1>
          <p className="text-xs text-white/40 font-light mt-1">Manage global admin configurations and variables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Store configurations */}
          <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082] flex items-center gap-2">
              <Globe size={16} />
              General Configuration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Store Brand Name</label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0B034]/40"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-lg px-2.5 py-2 text-xs text-white/80 focus:outline-none focus:border-[#E0B034]/40"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* API keys credentials */}
          <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082] flex items-center gap-2">
              <Server size={16} />
              Stripe Gateway Integration
            </h3>
            <div>
              <label className="text-[10px] text-white/40 tracking-wider block mb-1 uppercase font-semibold">Live Secret Key</label>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                className="w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0B034]/40"
              />
              <span className="text-[10px] text-white/30 mt-1 block">Stripe webhook calls route automatically.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Toggle Controls & Actions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/8 bg-white/[0.01] p-6 space-y-5">
            <h3 className="text-sm font-semibold tracking-wide text-[#FFE082] flex items-center gap-2 border-b border-white/8 pb-3">
              <Shield size={16} />
              System Status
            </h3>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Maintenance Mode</p>
                <p className="text-[10px] text-white/40">Lock store catalog updates</p>
              </div>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="w-4 h-4 accent-[#E0B034]"
              />
            </div>

            {/* Customer Signups */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Member Signups</p>
                <p className="text-[10px] text-white/40">Allow new buyer registrations</p>
              </div>
              <input
                type="checkbox"
                checked={signups}
                onChange={(e) => setSignups(e.target.checked)}
                className="w-4 h-4 accent-[#E0B034]"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#E0B034] text-[#0A0A0A] hover:bg-[#FFE082] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saved ? "CONFIGURATIONS SAVED!" : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </div>
  );
}
