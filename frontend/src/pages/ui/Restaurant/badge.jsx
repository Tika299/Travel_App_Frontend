import React from "react";
import clsx from "clsx"; // Nếu không dùng clsx, có thể bỏ và thay bằng template string thủ công

export const Badge = ({ children, color = "gray", className = "" }) => {
  const baseStyle = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const colorVariants = {
    gray: "bg-gray-100 text-gray-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <span className={clsx(baseStyle, colorVariants[color], className)}>
      {children}
    </span>
  );
};
