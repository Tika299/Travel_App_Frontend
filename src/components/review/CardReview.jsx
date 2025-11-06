import { FaLocationDot, FaRegStar, FaStar, FaTrashCan } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { BiComment, BiDotsHorizontalRounded } from "react-icons/bi";
import { ThumbsUp, MessageSquare, LineChart, Minus } from "lucide-react";
import ReviewImages from "./ReviewImages";
import { FaStarHalfAlt } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { TbStatusChange } from "react-icons/tb";
import ExpandableText from "./ExpandableText";
import {
  toggleLike,
  getLikeStatus,
} from "../../services/ui/Review/reviewService";
import Swal from "sweetalert2";

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

const PostTime = ({ createdAt }) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });
  return timeAgo;
};

export default function CardReview({ review, user, onEdit, onDelete }) {
  const isOwner = user?.id === review.user.id;
  const [openMenu, setOpenMenu] = useState(false);
  const toggleMenu = () => setOpenMenu((prev) => !prev);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  useEffect(() => {
    const fetchLike = async () => {
      try {
        const res = await getLikeStatus(review.id);
        setLikeCount(res.like_count);
        setLiked(res.liked_by_user);
      } catch (err) {
        console.error("Lỗi lấy trạng thái like:", err);
      }
    };
    if (user) fetchLike();
  }, [review.id, user]);

  const handleLike = async () => {
    if (!user) {
      Swal.fire({
        title: "Bạn cần đăng nhập",
        text: "Hãy đăng nhập để thích bài viết này.",
        icon: "info",
        confirmButtonText: "Đăng nhập",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return;
    }
    try {
      const res = await toggleLike(review.id);
      setLiked(res.liked);
      setLikeCount((prev) => (res.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Lỗi toggle like:", err);
    }
  };

  const handleDeleteClick = async () => {
    const result = await Swal.fire({
      title: "Bạn chắc chắn xoá?",
      text: "Bài viết sẽ bị xoá vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      setOpenMenu(false);
      onDelete(review.id);
    }
  };

  const formatTypeLabel = (type) => {
    switch (type) {
      case "App\\Models\\Hotel":
        return <span className="bg-blue-300 rounded-md px-1 ">Hotel</span>;
      case "App\\Models\\CheckinPlace":
        return (
          <span className="bg-green-300 rounded-md px-1 ">Checkin Place</span>
        );
      case "App\\Models\\Cuisine":
        return (
          <span className="bg-orange-300 rounded-md px-1 ">Ẩm thực</span>
        );
      default:
        return "Loại không xác định";
    }
  };

  return (
    <div className="mt-5 max-w-7xl xl:mx-auto lg:mx-10 md:mx-10 sm:mx-5">
      <div key={review.id} className="my-10 shadow-lg border p-4 rounded-xl">
        {/* Thông tin user post bài review */}
        <div className="flex items-start ">
          <img
            src={review.user.avatar}
            alt="Avatar"
            className="w-14 h-14 object-cover rounded-full"
          />

          <div className="w-full ml-5">
            <h2 className="text-xl font-bold">{review.user.name}</h2>
            <p className="flex items-center text-center mt-1 text-sm font-sans italic gap-1">
              <StarRating rating={review.rating} />
              <Minus size={12} />
              <PostTime createdAt={review.created_at} />
              <Minus size={12} />
              {formatTypeLabel(review.reviewable_type)}
            </p>
            {review.reviewable ? (
              <p className="flex items-center text-center text-gray-600 font-medium italic text-sm">
                <FaLocationDot className="text-red-600 mr-1" />
                {review.reviewable.name} <Minus size={12} className="mx-2" />
                {review.reviewable.address}
              </p>
            ) : (
              <p className="text-gray-500 italic text-sm">
                Địa điểm chưa được xác định
              </p>
            )}
          </div>

          {/* Update - Delete */}
          <div className="relative inline-block text-left">
            {/* Icon ba chấm */}
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <BiDotsHorizontalRounded className="text-xl" />
            </button>
          </div>
          {/* Menu mini */}
          {openMenu && (
            <div
              ref={menuRef}
              className="absolute right-20 mt-8 w-50 bg-white border shadow-lg rounded-lg z-20 text-sm"
            >
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      onEdit(review);
                    }}
                    className=" w-full text-left p-2 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <TbStatusChange /> Chỉnh sửa bài viết
                    </span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className=" w-full text-left p-2 text-red-600 hover:bg-red-50"
                  >
                    <span className="flex items-center gap-2">
                      <FaTrashCan /> Xoá
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Conter Post */}
        <div className="mt-2 flex items-start">
          <span className="text-1sm">
            <ExpandableText text={review.content} maxLength={90} />
          </span>
        </div>
        {/* Image Post */}
        {review.images?.length > 0 && <ReviewImages images={review.images} />}

        <div className="border-t-2 ">
          <div className="flex justify-between text-center mt-2">
            <button
              className={`flex px-20 py-1 hover:bg-gray-100 justify-center rounded-md 
               active:scale-95  ${
                 liked ? "text-blue-600" : "text-neutral-700"
               }`}
              onClick={handleLike}
            >
              <span className="flex gap-2 font-medium items-center">
                <ThumbsUp size={22} />
                {likeCount > 0 && <span>{likeCount}</span>} Like
              </span>
            </button>

            <button className="flex px-20 py-1 hover:bg-gray-100 justify-center rounded-md">
              <span className="flex gap-2 font-medium text-neutral-700">
                <MessageSquare size={22} /> Comment
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
