import React from "react";

const InputField = ({ 
  label, 
  type = "text", 
  placeholder, 
  required = false, 
  icon, 
  value, 
  onChange,
  isTextArea = false,
  className = ""
}) => {
  const baseClasses = "w-full bg-gray-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm dark:shadow-none";
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-4 transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        {isTextArea ? (
          <textarea
            required={required}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseClasses} h-32 resize-none`}
          />
        ) : (
          <input
            required={required}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={baseClasses}
          />
        )}

        {icon && (
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 text-sm">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;
