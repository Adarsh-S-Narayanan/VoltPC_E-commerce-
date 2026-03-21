import React from "react";

const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`${
      active
        ? "bg-primary text-white shadow-glow"
        : "bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-black/10 dark:border-white/5"
    } px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all border`}
  >
    {label}
  </button>
);

export default FilterButton;
