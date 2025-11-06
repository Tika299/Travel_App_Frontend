import { useState } from "react";
import { BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import { X } from "lucide-react";

const ReviewImages = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openModal = (index) => {
    setModalImageIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleModalPrev = () => {
    setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleModalNext = () => {
    setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative my-4 w-full h-[500px] overflow-hidden bg-black rounded-lg">
        {/* Container slide */}
        <div
          className="w-full h-full flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full h-full flex items-center justify-center bg-white cursor-pointer"
              onClick={() => openModal(idx)}
            >
              <img
                src={img.full_image_url || img.image_path}
                alt={`review-img-${idx}`}
                className="w-full h-full transition-transform duration-300 object-contain hover:scale-105"
                onError={(e) => {
                  console.error('Lỗi tải ảnh:', img.image_path);
                  e.target.src = 'https://via.placeholder.com/400x400?text=Image+Error';
                }}
              />
            </div>
          ))}
        </div>

      {/* Nút điều hướng */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
          >
            <BiSkipPrevious className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
          >
            <BiSkipNext className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Chấm vị trí */}
      <div className="absolute bottom-3 w-full flex justify-center gap-2">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>

      {/* Modal hiển thị ảnh full size */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Nút đóng */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>

            {/* Ảnh chính */}
            <div className="relative max-w-4xl max-h-full p-4">
              <img
                src={images[modalImageIndex]?.full_image_url || images[modalImageIndex]?.image_path}
                alt={`review-img-${modalImageIndex}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error('Lỗi tải ảnh modal:', images[modalImageIndex]?.image_path);
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Error';
                }}
              />
            </div>

            {/* Nút điều hướng modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handleModalPrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                >
                  <BiSkipPrevious className="w-8 h-8" />
                </button>
                <button
                  onClick={handleModalNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                >
                  <BiSkipNext className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Chấm vị trí modal */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === modalImageIndex ? "bg-white" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ReviewImages;
