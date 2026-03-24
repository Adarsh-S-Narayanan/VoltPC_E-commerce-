import React from "react";

const OrdersPage = ({ orders, onViewOrder, onBack }) => {
  // Sort orders by date, newest first
  // Assuming date format is like "MAR 24, 2026"
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="pt-24 min-h-screen bg-background-light dark:bg-background-dark max-w-[1200px] mx-auto px-6 pb-20 transition-colors duration-300">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="size-10 rounded-full bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 flex items-center justify-center hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase transition-colors">
              Your Orders
            </h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">
              Mission History ({orders.length} Transmissions)
            </p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 shadow-light-card dark:shadow-none transition-all duration-300">
        <div className="space-y-4">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-6xl">inventory_2</span>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                No active transmissions recorded
              </p>
              <button 
                onClick={onBack}
                className="mt-4 px-6 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                Return to Hub
              </button>
            </div>
          ) : (
            sortedOrders.map((order) => (
              <OrderRow
                key={order.id || order.orderId}
                id={order.id || order.orderId}
                date={order.date}
                status={order.status}
                total={`₹${order.total.toLocaleString()}`}
                onClick={() => onViewOrder(order.id || order.orderId)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const OrderRow = ({ id, date, status, total, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-6 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 hover:border-primary transition-all cursor-pointer group shadow-sm dark:shadow-none"
  >
    <div className="flex items-center gap-6">
      <div className="size-12 rounded-lg bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
          package_2
        </span>
      </div>
      <div>
        <p className="text-gray-900 dark:text-white font-black group-hover:text-primary transition-colors">
          {id}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest transition-colors">
          {date}
        </p>
      </div>
    </div>
    <div className="text-right flex items-center gap-8">
      <div>
        <p className="text-gray-900 dark:text-white font-mono text-lg transition-colors">
          {total}
        </p>
        <div className="flex items-center justify-end gap-2">
          <span className={`size-1.5 rounded-full ${
            status === 'Validated' ? 'bg-green-500' : 'bg-primary'
          } animate-pulse`}></span>
          <p className="text-primary text-[10px] uppercase font-black tracking-widest">
            {status}
          </p>
        </div>
      </div>
      <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1 transition-transform">
        chevron_right
      </span>
    </div>
  </div>
);

export default OrdersPage;
