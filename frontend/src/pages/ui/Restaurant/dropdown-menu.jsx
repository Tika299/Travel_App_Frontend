import React, { useState, useRef, useEffect } from "react";

// Component gốc DropdownMenu
export const DropdownMenu = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

// Nút bấm để mở menu
export const DropdownMenuTrigger = ({ children, onClick }) => {
  return (
    <button onClick={onClick} className="focus:outline-none">
      {children}
    </button>
  );
};

// Nội dung menu hiển thị
export const DropdownMenuContent = ({ children, show }) => {
  if (!show) return null;

  return (
    <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
    >
      {children}
    </button>
  );
};

export const DropdownMenuLabel = ({ children }) => {
  return (
    <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
};

export const DropdownMenuSeparator = () => {
  return <hr className="my-1 border-gray-200" />;
};
