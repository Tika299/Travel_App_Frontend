import { FaLocationDot, FaRegStar, FaStar } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { FaStarHalfAlt } from "react-icons/fa";

const PostTime = ({ createdAt }) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });
  return timeAgo;
};

const StarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }
  return stars;
};

export default function MyReview({ user, review }) {
  return (
    <div className="flex items-start mb-4 border p-4 rounded-lg shadow-sm bg-white">
      <img
        src={review.images.image_path}
        alt="Avatar"
        className="w-16 h-16 rounded-lg mr-4 object-cover"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
          <div className="flex items-center">
            <StarRating rating={review.rating} />
            <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-2">
          {review.reviewable_id || "Location"} •{" "}
          <PostTime createdAt={review.created_at} />
        </p>
        <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
          type
        </span>
        <p className="text-gray-700 mt-3 leading-relaxed">{review.content}</p>
        <div className="flex items-center space-x-4 text-gray-500 text-sm mt-3">
          <span>like hữu ích</span>
          <span>comment bình luận</span>
          <button className="ml-auto text-blue-600 hover:underline">
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}
