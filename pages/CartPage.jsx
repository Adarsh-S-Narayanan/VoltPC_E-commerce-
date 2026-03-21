import React from "react";

const CartPage = ({ items, onRemove, onCheckout, onContinueShopping }) => {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="pt-24 min-h-screen bg-background-light dark:bg-background-dark max-w-[1200px] mx-auto px-6 pb-20 transition-colors duration-300">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-10 tracking-tight transition-colors">
        SHOPPING CART
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark border border-dashed border-black/10 dark:border-white/10 rounded-2xl p-20 text-center shadow-light-card dark:shadow-none transition-all">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4 transition-colors">
                shopping_cart_off
              </span>
              <p className="text-gray-500 font-bold uppercase tracking-widest">
                Cart is empty
              </p>
              <button
                onClick={onContinueShopping}
                className="mt-6 bg-primary text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-xs shadow-glow transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartId}
                className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-6 flex items-center gap-6 group relative shadow-light-card dark:shadow-none hover:border-primary transition-all"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-black/40 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 flex-none transition-colors">
                  <img
                    src={item.image}
                    className="w-full h-full object-cover"
                    alt={item.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1 transition-colors">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.cartId)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl p-8 sticky top-24 shadow-light-card dark:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest transition-colors">
              Summary
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 dark:text-gray-400 transition-colors">
                <span>Subtotal</span>
                <span className="text-gray-900 dark:text-white font-mono transition-colors">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400 transition-colors">
                <span>Shipping</span>
                <span className="text-primary font-bold uppercase text-xs">
                  Standard Dispatch
                </span>
              </div>
              <div className="h-px bg-black/5 dark:bg-white/5 my-2 transition-colors"></div>
              <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white transition-colors">
                <span>Total</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className="w-full bg-primary hover:bg-[#6a19b0] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-glow transition-all"
            >
              Secure Checkout
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-widest transition-colors">
              Secure encrypted transactions only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
