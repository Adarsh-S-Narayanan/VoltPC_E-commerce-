import React, { useState, useEffect } from "react";
import { auth } from "../services/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import * as api from "../services/apiService";

const AccountPage = ({ user, orders, onLogout, onViewOrder, onNavigate }) => {
  const [resetStatus, setResetStatus] = useState(""); // "", "loading", "sent", "error"
  const [errorMessage, setErrorMessage] = useState("");
  
  // New states for editing
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      api.fetchUserProfile(user.uid).then(data => {
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await api.updateUserProfile(user.uid, { address, phone });
      setIsEditingAddress(false);
      setIsEditingContact(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const handlePasswordReset = async () => {
    setResetStatus("loading");
    setErrorMessage("");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetStatus("sent");
      setTimeout(() => setResetStatus(""), 5000); // Clear status after 5s
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message.replace("Firebase: ", ""));
      setResetStatus("error");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-background-light dark:bg-background-dark max-w-[1200px] mx-auto px-6 pb-20 transition-colors duration-300">
      <div className="flex items-center gap-8 mb-12">
        <div className="size-24 rounded-full bg-gradient-to-br from-primary to-purple-600 border-4 border-white/20 flex items-center justify-center shadow-glow">
          <span className="material-symbols-outlined text-4xl text-white">
            person
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase transition-colors">
            {user.username}
          </h1>
          <p className="text-primary text-xs font-black uppercase tracking-widest mt-1">
            Tier: {user.tier}
          </p>
          <p className="text-gray-500 text-sm mt-1 transition-colors">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 shadow-light-card dark:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-primary">
                history
              </span>
              Order Archive
            </h2>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                    No active transmissions
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    id={order.id}
                    date={order.date}
                    status={order.status}
                    total={`₹${order.total.toLocaleString()}`}
                    onClick={() => onViewOrder(order.id)}
                  />
                ))
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 shadow-light-card dark:shadow-none transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-primary">
                    lock
                  </span>
                  Security
                </h2>
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Update Access Code</p>
                  <button 
                    onClick={handlePasswordReset}
                    disabled={resetStatus === "loading"}
                    className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                      resetStatus === "sent" 
                        ? "bg-green-500 text-white" 
                        : "bg-primary/10 border border-primary/20 hover:bg-primary text-primary hover:text-white"
                    }`}
                  >
                    {resetStatus === "loading" ? "Processing..." : 
                     resetStatus === "sent" ? "Link Sent to Email" : "Reset Password"}
                  </button>
                  {resetStatus === "error" && (
                    <p className="text-[10px] text-red-500 font-bold uppercase">{errorMessage}</p>
                  )}
                  {resetStatus === "sent" && (
                    <p className="text-[10px] text-green-500 font-bold uppercase">Check your inbox/spam</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-primary">
                    location_on
                  </span>
                  Neural Hub
                </h2>
                <div className="space-y-4">
                   <p className="text-gray-900 dark:text-white font-bold text-sm">Main Logistics Address</p>
                   {isEditingAddress ? (
                     <div className="space-y-3">
                       <textarea 
                         value={address}
                         onChange={(e) => setAddress(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-xs text-gray-900 dark:text-white focus:border-primary outline-none transition-all h-24 resize-none"
                         placeholder="Enter address..."
                       />
                       <button 
                         onClick={handleSaveProfile}
                         disabled={isSaving}
                         className="px-6 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-glow disabled:opacity-50"
                       >
                         {isSaving ? "Saving..." : "Save Changes"}
                       </button>
                     </div>
                   ) : (
                     <>
                       <p className="text-gray-500 text-xs leading-relaxed whitespace-pre-line">
                         {address}
                       </p>
                       <button 
                         onClick={() => setIsEditingAddress(true)}
                         className="text-primary text-[10px] font-black uppercase tracking-widest mt-2 hover:underline flex items-center gap-1"
                       >
                         <span className="material-symbols-outlined text-xs">edit</span>
                         Edit Location
                       </button>
                     </>
                   )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 shadow-light-card dark:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-primary">
                contact_page
              </span>
              Contact Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 relative group">
                <p className="text-gray-400 dark:text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">Mobile Uplink</p>
                {isEditingContact ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-transparent border-b border-primary text-gray-900 dark:text-white font-black text-sm outline-none flex-1"
                    />
                    <button onClick={handleSaveProfile} disabled={isSaving} className="text-primary material-symbols-outlined text-sm disabled:opacity-50">check</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-900 dark:text-white font-black">{phone}</p>
                    <button onClick={() => setIsEditingContact(true)} className="opacity-0 group-hover:opacity-100 text-primary material-symbols-outlined text-sm transition-opacity">edit</button>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5">
                <p className="text-gray-400 dark:text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">Secondary Address</p>
                <p className="text-gray-900 dark:text-white font-black">{user.email}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 sticky top-24 shadow-light-card dark:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest transition-colors">
              Support Access
            </h2>
            <div className="space-y-3">
              <SupportButton 
                icon="inventory_2" 
                label="Driver Repository" 
                onClick={() => onNavigate("drivers")}
              />
              <SupportButton icon="monitoring" label="Live Diagnostics" />
              <SupportButton icon="description" label="Service Tickets" />
            </div>

            <button
              onClick={onLogout}
              className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white py-4 rounded-xl text-red-500 font-black uppercase tracking-widest text-[10px] transition-all mt-10 flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderRow = ({ id, date, status, total, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 hover:border-primary transition-all cursor-pointer group shadow-sm dark:shadow-none"
  >
    <div>
      <p className="text-gray-900 dark:text-white font-black group-hover:text-primary transition-colors">
        {id}
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest transition-colors">
        {date}
      </p>
    </div>
    <div className="text-right flex items-center gap-6">
      <div>
        <p className="text-gray-900 dark:text-white font-mono text-sm transition-colors">
          {total}
        </p>
        <p className="text-primary text-[10px] uppercase font-black tracking-widest">
          {status}
        </p>
      </div>
      <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
        chevron_right
      </span>
    </div>
  </div>
);

const StatusCard = ({ label, value, color }) => (
  <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 transition-colors">
    <p className="text-gray-400 dark:text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1 transition-colors">
      {label}
    </p>
    <p className={`text-xl font-black ${color} transition-colors`}>{value}</p>
  </div>
);

const SupportButton = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-primary hover:text-primary p-4 rounded-xl text-gray-900 dark:text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-sm dark:shadow-none"
  >
    <span className="material-symbols-outlined text-sm">{icon}</span>
    {label}
  </button>
);

export default AccountPage;
