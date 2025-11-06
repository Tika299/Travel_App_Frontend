import { useState } from "react";

const ExpandableText = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <span>{text}</span>; // Nếu ngắn thì hiển thị luôn
  }

  return (
    <span>
      {isExpanded ? text : `${text.slice(0, maxLength)}... `}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="text-blue-500 font-medium text-sm hover:underline ml-1"
      >
        {isExpanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </span>
  );
};

export default ExpandableText;
