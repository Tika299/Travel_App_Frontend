import banerImage from "../../assets/images/banner_reviewpage.jpg";
import Header from "../../components/Header";
import CardReview from "../../components/review/CardReview";
import Footer from "../../components/Footer";
import FormReview from "../../components/review/FormReview";
import { useEffect, useState } from "react";
import {
  getReviews,
  deleteReview,
  getUser,
} from "../../services/ui/Review/reviewService";
import CardReviewSkeleton from "../../components/review/CardReviewSkeleton";
import { Pagination } from "../../components/review/Pagination";
import FormReviewEdit from "../../components/review/FormReviewEdit";
import { toast, ToastContainer } from "react-toastify";

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [user, setUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    loadReviews(page);
  }, [page]);

  const fetchUser = async () => {
    try {
      const data = await getUser();
      setUser(data);
    } catch (error) {
      console.log(error);
      setUser(null);
    }
  };

  const loadReviews = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReviews(pageNum);
      setReviews(data.data);
      setLastPage(data.last_page);
    } catch (err) {
      console.error("Lỗi khi load reviews:", err);
      setError("Không thể tải danh sách bài review.");
    } finally {
      setLoading(false);
    }
  };

  const reloadFirstPage = async () => {
    setPage(1);
    await loadReviews(1);
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      if (reviews.length === 1 && page > 1) {
        setPage(page - 1);
      }
      toast.success("Review deleted");
    } catch (err) {
      console.error("Lỗi khi xóa bài review:", err);
      toast.error("❌ Không thể xoá bài review.");
      setError("Không thể xóa bài review.");
    }
  };

  return (
    <>
      <Header />
      <ToastContainer autoClose={800} />
      {/* Banner */}
      <div className="p-2">
        <div
          className="w-full h-[150px] bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${banerImage})`,
          }}
        >
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-white text-center px-4">
            <h1 className="text-4xl font-bold text-white">Review Du Lịch</h1>
            <p className="mt-2 text-sm italic">
              Chia sẻ những trải nghiệm của bạn tại các địa điểm đã ghé thăm
            </p>
          </div>
        </div>
      </div>

      {/* User Post Review */}
      <FormReview user={user} onSuccess={reloadFirstPage} />

      {/* Loading Skeleton */}
      {loading && (
        <>
          {[...Array(2)].map((_, idx) => (
            <CardReviewSkeleton key={idx} />
          ))}
        </>
      )}
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="flex justify-center items-center my-10">
          <p className="text-red-500 text-lg">Đã xảy ra lỗi: {error}</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          {reviews.map((review) => (
            <CardReview
              key={review.id}
              review={review}
              user={user}
              onDelete={handleDelete}
              onEdit={(r) => setEditingReview(r)}
            />
          ))}

          <Pagination page={page} setPage={setPage} lastPage={lastPage} />
        </>
      )}

      {editingReview && (
        <FormReviewEdit
          user={user}
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSuccess={() => {
            setEditingReview(null);
            loadReviews(1);
          }}
        />
      )}

      {/* Không có review */}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center my-10 text-gray-500 text-lg">
          Chưa có bài review nào được đăng.
        </div>
      )}

      <Footer />
    </>
  );
};

export default ReviewPage;
