import React from "react";

export const Avatar = ({ className = "", children }) => {
  return (
    <div className={`relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const AvatarImage = ({ src, alt = "Avatar" }) => {
  return (
    <img
      src={src}
      alt={alt}
      className="object-cover w-full h-full"
    />
  );
};

export const AvatarFallback = ({ name }) => {
  const initials = name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-center w-full h-full text-white bg-blue-500 font-semibold">
      {initials || "?"}
    </div>
  );
};
