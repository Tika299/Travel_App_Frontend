import { useCallback, useState } from "react";
import avatar_user from "../../assets/images/avatar-default-svgrepo-com.png";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
  createReview,
  uploadReviewImage,
} from "../../services/ui/Review/reviewService";
import StarRatingPost from "./StarRatingPost";
import { BiCamera } from "react-icons/bi";
import WebcamCapture from "./WebcamCapture";
import { Camera, CameraIcon, CameraOffIcon } from "lucide-react";
import { FaCamera } from "react-icons/fa";

const FormReview = ({ user, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  const handleOpenForm = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    setOpen(true);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [],
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const reviewPayload = {
        content: data.content,
        rating: parseInt(data.rating),
      };
      const res = await createReview(reviewPayload);
      const reviewId = res.data.id;

      // 2. Nếu có ảnh, upload lên
      await uploadReviewImage(
        reviewId,
        files.map((f) => (f instanceof File ? f : new File([f], f.name)))
      );

      if (onSuccess) await onSuccess();
    } catch (error) {
      console.error("Lỗi gửi review:", error);
    } finally {
      reset();
      setOpen(false);
      setFiles([]); // Xóa ảnh đã chọn sau khi gửi
      setPreviewImages([]);
    }
  };

  return (
    <>
      {/* Form thu nhỏ */}
      <div
        onClick={handleOpenForm}
        className="cursor-pointer mt-5 max-w-7xl shadow-lg border rounded-md p-4 xl:mx-auto lg:mx-10 md:mx-10 sm:mx-5"
      >
        <div className="flex items-start space-x-4">
          <img
            src={user?.avatar || avatar_user}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover border"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder={`${
                user?.name || "Bạn"
              } hãy chia sẻ trải nghiểm của mình nhé.`}
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none text-sm cursor-pointer"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Modal form to */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Tạo bài viết</h2>

            <div className="flex items-start space-x-4 mb-4">
              <img
                src={user?.avatar || avatar_user}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{user?.name}</h3>
                <span className="text-sm text-gray-500">
                  Chia sẻ với bạn bè
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <StarRatingPost name="rating" control={control} />

              <textarea
                {...register("content", { required: true })}
                placeholder="Mô tả cụ thể trải nghiệm của bạn tại địa điểm này..."
                className="w-full border p-2 rounded h-32"
              />

              {/* Chụp bằng webcam */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="bg-gray-100 rounded text-sm px-3 py-1  flex text-center items-center gap-2"
                >
                  <FaCamera /> Chụp bằng webcam
                </button>
              </div>
              {showWebcam && (
                <WebcamCapture
                  onCapture={(file) => {
                    const preview = URL.createObjectURL(file);
                    setFiles((prev) => [
                      ...prev,
                      Object.assign(file, { preview }),
                    ]);
                  }}
                  onClose={() => setShowWebcam(false)}
                />
              )}

              <div className="w-full border border-dashed border-gray-400 p-2 rounded-lg text-center">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-blue-500">Thả ảnh vào đây...</p>
                  ) : (
                    <p className="flex items-center justify-center text-gray-700 gap-4 font-medium">
                      <BiCamera className="w-6 h-6" />
                      Nhấn vào để thêm ảnh
                    </p>
                  )}
                </div>

                {/* Preview ảnh đã chọn */}
                <div className="flex flex-wrap gap-4 mt-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={file.preview}
                        alt="preview"
                        className="w-32 h-32 object-cover rounded"
                      />
                      <button
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md text-center relative">
            <h2 className="text-xl font-semibold mb-4">
              Bạn cần đăng nhập để đăng bài!!!
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setShowLoginDialog(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormReview;
