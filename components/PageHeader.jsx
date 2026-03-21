import React from "react";

const PageHeader = ({ title, description, centered = false }) => (
  <div className={`mb-12 ${centered ? "text-center" : "text-center md:text-left"}`}>
    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 uppercase transition-colors">
      {title}
    </h1>
    <p className={`text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed transition-colors ${centered ? "max-w-3xl mx-auto" : "max-w-2xl"}`}>
      {description}
    </p>
  </div>
);

export default PageHeader;
