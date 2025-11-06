import { useState } from "react";
import { Controller } from "react-hook-form";
import { FaStar } from "react-icons/fa";

const StarRatingPost = ({ control, name }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={0}
      render={({ field }) => (
        <div className="flex space-x-5 justify-center my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => field.onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
            >
              <FaStar
                className={`w-7 h-7 transition-colors ${
                  star <= (hovered || field.value)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    />
  );
};

export default StarRatingPost;
