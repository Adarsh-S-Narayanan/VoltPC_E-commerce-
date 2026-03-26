import React, { useState, useEffect } from "react";
import InputField from "../components/InputField";
import * as api from "../services/apiService";

const CheckoutPage = ({ items, onComplete, user }) => {
  const [loading, setLoading] = useState(false);
  
  // Storage for critical shipping vector & identity limits
  const [firstName, setFirstName] = useState(user?.username?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.username?.split(" ")[1] || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [contact, setContact] = useState("");
  const [uroPayOrderId, setUroPayOrderId] = useState(null);
  const [upiString, setUpiString] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentStep, setPaymentStep] = useState("shipping"); // shipping, upi, verifying
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.uid) {
      api.fetchUserProfile(user.uid).then(data => {
        if (data.address) {
          setAddress(data.address);
        }
        if (data.phone) {
          setContact(data.phone);
        }
      });
    }
  }, [user]);

  const total = items.reduce((acc, item) => acc + item.price, 0);
  const advanceAmount = Math.floor(total * 0.4);
  const remainingAmount = total - advanceAmount;

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fullAddress = `${address}, ${city}, ${postal}`;
    
    try {
      const orderData = {
        amount: advanceAmount, // 40% advance as requested
        customerName: `${firstName} ${lastName}`.trim(),
        customerEmail: user?.email || "guest@example.com",
        merchantOrderId: `VPC-${Date.now()}`,
        transactionNote: `Order for ${firstName} ${lastName} (40% Advance)`
      };

      const uroPayOrder = await api.createUroPayOrder(orderData);
      setUroPayOrderId(uroPayOrder.uroPayOrderId);
      setUpiString(uroPayOrder.upiString);
      setQrCode(uroPayOrder.qrCode);
      setPaymentStep("upi");
    } catch (err) {
      setError(err.message || "Failed to initiate UroPay payment");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!referenceNumber) {
      setError("Please enter the UPI Reference Number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await api.verifyUroPayPayment({
        uroPayOrderId,
        referenceNumber
      });

      if (result.status === "success") {
        const fullAddress = `${address}, ${city}, ${postal}`;
        const customerData = {
          customerName: `${firstName} ${lastName}`.trim(),
          email: user?.email || "guest@example.com",
          address: fullAddress,
          contact: contact,
          payment: "UPI (UroPay)",
          uroPayOrderId: uroPayOrderId,
          referenceNumber: referenceNumber
        };
        onComplete(customerData);
      } else {
        setError("Verification failed. Please check the reference number.");
      }
    } catch (err) {
      setError(err.message || "Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Polling for automated payment detection
  useEffect(() => {
    let intervalId;

    if (paymentStep === 'upi' && uroPayOrderId) {
      console.log(`Starting polling for order: ${uroPayOrderId}`);
      intervalId = setInterval(async () => {
        try {
          const statusResult = await api.fetchUroPayStatus(uroPayOrderId);
          console.log('Poll Status:', statusResult.data?.orderStatus);
          
          if (statusResult.data?.orderStatus === 'COMPLETED') {
            console.log('Payment detected automatically!');
            clearInterval(intervalId);
            
            // Automatically complete with a marker for auto-verification
            const fullAddress = `${address}, ${city}, ${postal}`;
            const customerData = {
              customerName: `${firstName} ${lastName}`.trim(),
              email: user?.email || "guest@example.com",
              address: fullAddress,
              contact: contact,
              payment: "UPI (Auto-Verified)",
              uroPayOrderId: uroPayOrderId,
              referenceNumber: "AUTO-DETECTED"
            };
            onComplete(customerData);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        console.log('Stopping polling');
        clearInterval(intervalId);
      }
    };
  }, [paymentStep, uroPayOrderId, address, city, postal, firstName, lastName, user, contact, onComplete]);

  return (
    <div className="pt-24 min-h-screen bg-background-light dark:bg-background-dark max-w-[1200px] mx-auto px-6 pb-20 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-10 tracking-tight transition-colors">
            SECURE CHECKOUT
          </h1>
          <form onSubmit={handleInitiatePayment} className="space-y-8">
            {paymentStep === "shipping" && (
              <>
                <section className="space-y-4">
                  <h2 className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-4">
                    Shipping Protocol
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    <InputField placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                  <InputField placeholder="Email Address" value={user?.email || ""} readOnly />
                  <InputField placeholder="Contact Number" value={contact} onChange={e => setContact(e.target.value)} required />
                  <InputField placeholder="Full Address" value={address} onChange={e => setAddress(e.target.value)} required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField placeholder="City" value={city} onChange={e => setCity(e.target.value)} required />
                    <InputField placeholder="Postal Code" value={postal} onChange={e => setPostal(e.target.value)} required />
                  </div>
                </section>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-[#6a19b0] text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] shadow-glow transition-all active:scale-95"
                >
                  {loading
                    ? "PREPARING TRANSMISSION..."
                    : `PAY 40% ADVANCE ₹${advanceAmount.toLocaleString()}`}
                </button>
              </>
            )}

            {paymentStep === "upi" && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                  <h2 className="text-primary text-xs font-black uppercase tracking-[0.2em]">
                    UPI Secure Channel
                  </h2>
                  <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-lg border border-gray-100">
                    <img src={qrCode} alt="UPI QR Code" className="size-48" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      Scan QR Code or Use UPI ID
                    </p>
                    <a 
                      href={upiString}
                      className="inline-block text-primary font-mono text-sm font-bold hover:underline"
                    >
                      Pay via UPI App
                    </a>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-primary/60 animate-pulse">
                    <span className="material-symbols-outlined text-sm">sync</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Waiting for payment... (Auto-detecting)
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <InputField 
                      placeholder="Enter UPI Reference Number (UTR / Transaction ID)" 
                      value={referenceNumber} 
                      onChange={e => setReferenceNumber(e.target.value)} 
                      required 
                      icon="confirmation_number"
                    />
                    <div className="mt-2 flex items-start gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      <span className="material-symbols-outlined text-xs">info</span>
                      Enter the 12-digit transaction ID from your payment app
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyPayment}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-[#6a19b0] text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] shadow-glow transition-all active:scale-95"
                  >
                    {loading
                      ? "VERIFYING TRANSACTION..."
                      : "VERIFY & COMPLETE ORDER"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentStep("shipping")}
                    className="w-full bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-white py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    Back to Shipping
                  </button>
                </div>
              </section>
            )}
          </form>
        </div>

        <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-10 h-fit sticky top-24 shadow-light-card dark:shadow-none transition-all duration-300">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest transition-colors">
            Order Review
          </h2>
          <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div
                key={item.cartId}
                className="flex justify-between items-center gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-black/40 flex-none border border-black/5 dark:border-white/5 transition-colors">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 dark:text-white text-sm font-bold truncate transition-colors">
                      {item.name}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest transition-colors">
                      {item.category}
                    </p>
                  </div>
                </div>
                <span className="text-gray-900 dark:text-white font-mono text-sm transition-colors">
                  ₹{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="h-px bg-black/5 dark:bg-white/5 mb-6 transition-colors"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest transition-colors">
              <span>Total Amount</span>
              <span className="font-mono">₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-primary font-black uppercase tracking-widest transition-colors">
              <span>Advance (40%)</span>
              <span className="font-mono">₹{advanceAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 dark:text-white transition-colors border-t border-black/5 dark:border-white/5 pt-4">
              <span>TO PAY NOW</span>
              <span className="font-mono">₹{advanceAmount.toLocaleString()}</span>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-1">
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Payment Protocol</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                Pay <span className="font-bold text-primary">₹{advanceAmount.toLocaleString()}</span> as a secure advance. The remaining <span className="font-bold text-primary">₹{remainingAmount.toLocaleString()}</span> (60%) shall be paid on pick up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
