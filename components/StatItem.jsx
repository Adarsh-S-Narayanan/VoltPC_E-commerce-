import React from "react";

const StatItem = ({ value, label }) => (
  <div>
    <h4 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
      {value}
    </h4>
    <p className="text-xs text-primary font-black uppercase tracking-widest">
      {label}
    </p>
  </div>
);

export default StatItem;
