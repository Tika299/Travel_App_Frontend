import { useEffect, useState } from "react";
import MyReview from "../../components/review/MyReview";
import { getMyReviews } from "../../services/ui/Review/reviewService";

export default function MyReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadReviews(page);
  }, [page]);

  const loadReviews = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyReviews(pageNum);
      setReviews(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error("Lỗi khi load reviews:", err);
      setError("Không thể tải danh sách bài review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex px-4 py-2 w-full h-[300] bg-slate-100 rounded-lg my-4 space-x-14">
      {/* Bộ lọc đánh giá */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 h-[400px]">
        <h3 className="font-semibold text-lg mb-4">Bộ lọc đánh giá</h3>

        <div className="mb-4">
          <p className="font-medium text-gray-700 mb-2">Loại đánh giá</p>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              className="form-checkbox text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-800">Tất cả</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              className="form-checkbox text-blue-600 rounded"
              defaultChecked
            />
            <span className="ml-2 text-gray-800">Nhà hàng</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              className="form-checkbox text-blue-600 rounded"
              defaultChecked
            />
            <span className="ml-2 text-gray-800">Khách sạn</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-800">Điểm tham quan</span>
          </label>
        </div>

        <div>
          <p className="font-medium text-gray-700 mb-2">Đánh giá sao</p>
          {[5, 4, 3].map((stars) => (
            <label key={stars} className="flex items-center mb-2">
              <input
                type="radio"
                name="star-rating"
                className="form-radio text-yellow-500"
                defaultChecked={stars === 5} // Example: 5 stars checked by default
              />
              <span className="ml-2 flex items-center">
                {Array(stars)
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.487 7.244l6.572-.955L10 0l2.941 6.289 6.572.955-4.758 4.634 1.123 6.545z" />
                    </svg>
                  ))}
                <span className="ml-2 text-gray-800">{stars}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Đánh giá của tôi */}
      <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
        {!loading && !error && reviews.length > 0 && (
          <>
            {reviews.map((review) => (
              <MyReview key={review.id} review={review} user={user} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
