import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import avatar_user_2 from "../../assets/images/avatar_user_review_2.png";
import avatar_user from "../../assets/images/avatar_user_review.jpg";

const data = {
  ratingSummary: {
    averageRating: 4.8,
    totalReviews: 324,
    ratingsBreakdown: {
      5: 78,
      4: 15,
      3: 5,
      2: 1,
      1: 1,
    },
  },
  reviews: [
    {
      name: "Nguyễn Minh Anh",
      avatar: avatar_user,
      rating: 5,
      timeAgo: "2 ngày trước",
      comment:
        "Chỉ có trên Tripadvisor: Xem khách sạn được xếp hạng theo chỉ số 'Giá trị tốt nhất' của chúng tôi, kết hợp xếp hạng từ khách du lịch, giá tốt nhất, vị trí và nhiều thông tin khác.",
      likes: 23,
      hasReply: true,
    },
    {
      name: "Nguyễn Kim Anh",
      avatar: avatar_user_2,
      rating: 5,
      timeAgo: "5 ngày trước",
      comment:
        "Chỉ với một cú nhấp chuột, chúng tôi so sánh giá từ hơn 200 trang web đặt phòng khách sạn - bao gồm cả trang web của chính khách sạn - để giúp bạn tìm giá thấp nhất cho khách sạn lý tưởng của bạn.",
      likes: 39,
      hasReply: true,
    },
  ],
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
export default function ReviewCustomers() {
  return (
    <div className="w-full p-4 mt-5 mx-auto max-w-7xl">
      <h2 className="text-2xl font-bold">Đánh giá từ khách hàng</h2>
      <div className="flex mt-5 space-x-4">
        <div className="w-32 flex-auto items-center text-center space-y-2 border rounded-lg bg-neutral-100 h-[100px]">
          <h2 className="text-2xl font-bold">
            {data.ratingSummary.averageRating}
          </h2>
          <p className="flex items-center justify-center space-x-2">
            <StarRating rating={data.ratingSummary.averageRating} />
          </p>
          <p>Dựa trên {data.ratingSummary.totalReviews} đánh giá</p>
        </div>

        <div className="w-64 flex-auto space-y-4">
          {data.reviews.map((review, index) => (
            <div key={index} className="border rounded-lg py-4 px-2">
              <div className="flex space-x-3">
                <img
                  src={review.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-md font-semibold">{review.name}</h2>
                  <span className="flex space-x-1.5 text-center justify-center">
                    <StarRating rating={review.rating} />
                  </span>
                </div>
              </div>

              <div className="max-w-1xl text-sm mx-4 py-2">
                {review.comment}
              </div>
            </div>
          ))}
          <button className="w-full bg-gray-300 rounded-lg py-1 border font-bold hover:border-gray-300">
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  );
}
