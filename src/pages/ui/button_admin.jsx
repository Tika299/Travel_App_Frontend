export const Button = ({ className = "", children, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
