// components/WebcamCapture.jsx
import React, { useRef } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `webcam-${Date.now()}.png`, {
          type: "image/png",
        });
        onCapture(file);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg space-y-4 text-center">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          className="w-full rounded"
        />
        <div className="flex gap-4 justify-center">
          <button
            onClick={capture}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            📷 Chụp
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            ✖ Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;
