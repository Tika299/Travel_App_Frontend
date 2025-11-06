import { useCallback, useEffect, useState } from "react";
import avatar_user from "../../assets/images/avatar_user_review.jpg";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
  deleteReviewImages,
  updateReview,
  uploadReviewImage,
} from "../../services/ui/Review/reviewService";
import StarRatingPost from "./StarRatingPost";
import { BiCamera } from "react-icons/bi";
import { toast } from "react-toastify";

const FormReviewEdit = ({ user, review, onSuccess, onClose }) => {
  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState(review.images || []);

  const handleDeleteImage = async (image) => {
    try {
      await deleteReviewImages(image.id);
      setExistingImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (error) {
      console.error("Lỗi xoá ảnh:", error);
    }
  };

  useEffect(() => {
    if (review?.images?.length) {
      setPreviewImages(review.images);
    }
  }, [review]);

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
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      content: review?.content,
      rating: review?.rating,
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        content: data.content,
        rating: parseInt(data.rating),
      };
      await updateReview(review.id, payload);

      if (files.length > 0) {
        await uploadReviewImage(
          review.id,
          files.map((f) => (f instanceof File ? f : new File([f], f.name)))
        );
      }

      if (onSuccess) await onSuccess();
      toast.success("Update Review");
    } catch (err) {
      console.error("Lỗi cập nhật review:", err);
    } finally {
      reset();
      setFiles([]);
      setPreviewImages([]);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Chỉnh sửa bài viết</h2>

        <div className="flex items-start space-x-4 mb-4">
          <img
            src={user?.avatar ? avatar_user : "User"}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold">{user?.name}</h3>
            <span className="text-sm text-gray-500">
              Cập nhật bài viết của bạn
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <StarRatingPost name="rating" control={control} />

          <textarea
            {...register("content", { required: true })}
            placeholder="Cập nhật trải nghiệm của bạn..."
            className="w-full border p-2 rounded h-32"
          />

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

            <div className="flex flex-wrap gap-4 mt-2">
              {existingImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.full_image_url || image.image_path}
                    alt="uploaded"
                    className="w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      console.error('Lỗi tải ảnh:', image.image_path);
                      e.target.src = 'https://via.placeholder.com/128x128?text=Image+Error';
                    }}
                  />
                  <button
                    onClick={() => handleDeleteImage(image)}
                    className="absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {files.map((file, index) => (
                <div key={index + previewImages.length} className="relative">
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormReviewEdit;
