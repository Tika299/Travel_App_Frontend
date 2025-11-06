import React from "react";

const Select = ({ className = "", children, onValueChange, ...props }) => {
  return (
    <select
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      onChange={(e) => onValueChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );
};

const SelectTrigger = ({ children, ...props }) => {
  return <>{children}</>;
};

const SelectValue = ({ placeholder }) => {
  return <option value="">{placeholder}</option>;
};

const SelectContent = ({ children }) => {
  return <>{children}</>;
};

const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};
