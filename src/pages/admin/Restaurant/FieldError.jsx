// components/FieldError.jsx
const FieldError = ({ field, errors }) => {
  if (!errors || !errors[field]) return null;

  return (
    <p className="text-sm text-red-500 mt-1 ml-1">
      {Array.isArray(errors[field]) ? errors[field][0] : errors[field]}
    </p>
  );
};

export default FieldError;
