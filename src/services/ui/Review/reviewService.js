import axios from "axios";
const URL_LINK = "http://localhost:8000/api";

export const getReview = async (reviewId) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${URL_LINK}/review/${reviewId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMyReviews = async (page = 1) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${URL_LINK}/my-reviews?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const getReviews = async (page = 1) => {
  const res = await axios.get(`${URL_LINK}/reviews?page=${page}`);
  return res.data;
};

export const createReview = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${URL_LINK}/reviews`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const uploadReviewImage = async (reviewId, files) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images[]", file);
  });

  const res = await axios.post(
    `${URL_LINK}/reviews/${reviewId}/images`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const updateReview = async (reviewId, formData) => {
  const token = localStorage.getItem("token");

  const res = await axios.put(`${URL_LINK}/reviews/${reviewId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const deleteReview = async (reviewId) => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`${URL_LINK}/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getUser = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${URL_LINK}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
// Route::delete('/review-images/{id}', [ReviewImageController::class, 'destroy']);

export const deleteReviewImages = async (imageId) => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(`${URL_LINK}/review-images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const toggleLike = async (reviewId) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${URL_LINK}/reviews/${reviewId}/like`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // { liked: true/false, message: '...' }
};

export const getLikeStatus = async (reviewId) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${URL_LINK}/reviews/${reviewId}/like-count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // { like_count: 10, liked_by_user: true/false }
};
