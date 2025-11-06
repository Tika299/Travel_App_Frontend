import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Cuisine from "./pages/ui/Cuisine";
import FoodList from "./pages/admin/FoodList";
import FoodCreate from "./pages/admin/FoodCreate";
import FoodEdit from "./pages/admin/FoodEdit";
import { Link } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import CuisineAll from "./pages/ui/CuisineAll";
import CulinaryDetail from "./pages/ui/CulinaryDetail";
import CategoryList from "./pages/admin/CategoryList";

// 👥 Public UI Pages
import HomePage from "./pages/ui/HomePage";
import TransportCompanyPage from "./pages/ui/TransportCompany/TransportCompanyPage";
import CheckinPlacePage from "./pages/ui/CheckinPlace/CheckinPlacePage";
import CheckinPlaceDetail from "./pages/ui/CheckinPlace/CheckinPlaceDetail";
import TransportCompanyDetail from "./pages/ui/TransportCompany/TransportCompanyDetail";
import FavouritePage from "./pages/ui/FavouritePage";
import ProfilePage from "./pages/ui/ProfilePage.jsx";
import HotelList from "./pages/admin/Hotel/HotelList.jsx";
import HotelPage from "./pages/ui/Hotel/HotelPage.jsx";
import HotelDetailPage from "./pages/ui/Hotel/HotelDetailPage.jsx";
import RestaurantList from "./components/Restaurant/RestaurantList";
import RestaurantDetail from "./components/Restaurant/RestaurantDetail";

//đăng ky, đăng nhập,quên mật khẩu
import LoginPage from "./pages/ui/User/Login-page.jsx";
import RegistrationPage from "./pages/ui/User/Registration-page.jsx";
import ForgotPassWordPage from "./pages/ui/User/Forgot-password-page.jsx";
import VerifyPage from "./pages/ui/User/Verify-code-page.jsx";
import ResetPassWordPage from "./pages/ui/User/Reset-password-page.jsx";
//google
import GoogleSuccess from "./pages/ui/User/GoogleSuccessPage.jsx";
//facebook
import FacebookSuccess from "./pages/ui/User/FacebookSuccess.jsx";
//hiển thị dữ liệu
import OAuthSuccess from "./pages/ui/User/Oauth-success.jsx";
//tài khoản
import Account from "./pages/ui/User/Account.jsx";
import EditAccount from "./pages/ui/User/EditAccount.jsx";

// 🛠 Admin - User
import AdminUserList from "./pages/admin/User/index.jsx";
import AdminUserCreate from "./pages/admin/User/create.jsx";
import AdminUserEdit from "./pages/admin/User/edit.jsx";

// 🛠 Admin - TransportCompany
import AdminTransportCompanyList from "./pages/admin/TransportCompany/index";
import AdminTransportCompanyCreate from "./pages/admin/TransportCompany/create";
import AdminTransportCompanyEdit from "./pages/admin/TransportCompany/edit";

// 🛠 Admin - CheckinPlace
import AdminCheckinPlaceList from "./pages/admin/CheckinPlace/index";
import AdminCheckinPlaceCreate from "./pages/admin/CheckinPlace/create";
import AdminCheckinPlaceEdit from "./pages/admin/CheckinPlace/edit";

// 🛠 Admin - Transportation (New)
import AdminTransportationList from "./pages/admin/Transportation/index.jsx";
import AdminTransportationCreate from "./pages/admin/Transportation/create.jsx";
import AdminTransportationEdit from "./pages/admin/Transportation/edit.jsx";

import ReviewPage from "./pages/ui/ReviewPage.jsx";

// 🛠 Admin - Restaurant
import RestaurantManagement from "./pages/admin/Restaurant/RestaurantManagement";
import AddRestaurant from "./pages/admin/Restaurant/AddRestaurant";
import EditRestaurant from "./pages/admin/Restaurant/EditRestaurant";

// Sidebar - Restaurant
import AdminLayout from "./pages/admin/Restaurant/AdminLayout.jsx";

import Sidebar from "./components/ui/schedule/Sidebar";
import CalendarFull from "./components/ui/schedule/CalendarFull";
import SchedulePage from "./components/ui/schedule/SchedulePage";
import AITravelChat from "./components/ui/schedule/AITravelChat";
import { ToastContainer } from 'react-toastify';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* AI Travel Chat - Floating Icon - Hiển thị trên tất cả màn hình */}
      <AITravelChat 
        onGenerateItinerary={(itineraryData) => {
          // Xử lý khi AI tạo lịch trình từ chat
          console.log('Generated itinerary from chat:', itineraryData);
          // Có thể mở modal AI Travel với dữ liệu này
        }}
      />
      
      <Routes>

        {/* ===== PUBLIC PAGES ===== */}
        <Route path="/" element={<HomePage />} />

        {/* Hotels */}
        <Route path="/admin/hotels" element={<AdminLayout>
          <HotelList />
        </AdminLayout>} />
        <Route path="/hotels" element={<HotelPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forgot_password" element={<ForgotPassWordPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/resetpass" element={<ResetPassWordPage />} />
        {/* google */}
        <Route path="/google-success?token=" element={<GoogleSuccess />} />
        {/* google */}
        <Route path="//facebook-success" element={<FacebookSuccess />} />
        {/* data */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        {/* tài khoản */}
        <Route path="/account" element={<Account />} />
        <Route path="/edit-account" element={<EditAccount />} />

        {/* ===== ADMIN - User ===== */}
        <Route path="/admin/User" element={
          <AdminLayout>
            <AdminUserList />
          </AdminLayout>
        } />
        <Route path="/admin/User/create" element={
          <AdminLayout>
            <AdminUserCreate />
          </AdminLayout>} />
        <Route path="/admin/User/edit/:id" element={
          <AdminLayout>
            <AdminUserEdit />
          </AdminLayout>
        } />

        {/* 1. Đặt route /checkin-places/all LÊN TRƯỚC */}
        {/* Route này sẽ hiển thị tất cả các địa điểm, sử dụng cùng component CheckinPlacePage */}
        <Route
          path="/checkin-places/all"
          element={<CheckinPlacePage showAll={true} />}
        />

        {/* 2. Route /checkin-places (nếu có) cũng nên đứng trước route động có :id */}
        {/* Route này có thể dùng để hiển thị các địa điểm gợi ý hoặc trang chính */}
        <Route path="/checkin-places" element={<CheckinPlacePage />} />

        {/* 3. Đặt route động /checkin-places/:id XUỐNG DƯỚI CÙNG trong nhóm này */}
        <Route path="/checkin-places/:id" element={<CheckinPlaceDetail />} />

        <Route path="/transport-companies" element={<TransportCompanyPage />} />

        <Route
          path="/transport-companies/:id"
          element={<TransportCompanyDetail />}
        />
        <Route path="/favorites" element={<FavouritePage />} />

        {/* ===== ADMIN - Transport Companies ===== */}
        <Route
          path="/admin/transport-companies"
          element={
            <AdminLayout>
              <AdminTransportCompanyList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/transport-companies/create"
          element={
            <AdminLayout>
              <AdminTransportCompanyCreate />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/transport-companies/edit/:id"
          element={
            <AdminLayout>
              <AdminTransportCompanyEdit />
            </AdminLayout>
          }
        />

        {/* ===== ADMIN - Checkin Places ===== */}
        <Route
          path="/admin/checkin-places"
          element={
            <AdminLayout>
              <AdminCheckinPlaceList />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/checkin-places/create"
          element={
            <AdminLayout>
              <AdminCheckinPlaceCreate />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/checkin-places/edit/:id"
          element={
            <AdminLayout>
              <AdminCheckinPlaceEdit />
            </AdminLayout>
          }
        />

        {/* ===== ADMIN - Transportation (New Routes) ===== */}

        <Route
          path="/admin/transportations"
          element={
            <AdminLayout>
              <AdminTransportationList />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/transportations/create"
          element={
            <AdminLayout>
              <AdminTransportationCreate />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/transportations/edit/:id"
          element={
            <AdminLayout>
              <AdminTransportationEdit />
            </AdminLayout>
          }
        />

        {/* Trang ẩm thực */}
        <Route path="/cuisine" element={<Cuisine />} />
        {/* Trang xem tất cả món ăn */}
        <Route path="/cuisine/all" element={<CuisineAll />} />
        {/* Trang chi tiết món ăn */}
        <Route path="/cuisine/:id" element={<CulinaryDetail />} />

        {/* Trang admin - danh sách món ăn */}
        <Route path="/admin/foods" element={
          <AdminLayout>
              <FoodList />
            </AdminLayout>}/>
        {/* Trang admin - thêm ẩm thực */}
        <Route path="/admin/foods/create" element={
          <AdminLayout>
              <FoodCreate />
            </AdminLayout>}/>
        {/* Trang admin - sửa ẩm thực */}
        <Route path="/admin/foods/:id/edit" element={
           <AdminLayout>
              <FoodEdit />
            </AdminLayout>}/>
        {/* Trang admin - danh mục */}
        <Route path="/admin/categories" element={
           <AdminLayout>
              <CategoryList />
            </AdminLayout>}/>
        {/* Trang review */}
        <Route path="/review" element={<ReviewPage />} />
        {/* Trang Hotel */}
        <Route path="/hotels/:id" element={<HotelDetailPage />} />

        {/* Trang cá nhân */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* ===== LỊCH TRÌNH (SCHEDULE) ===== */}
        <Route path="/schedule" element={<SchedulePage />} />

        {/* ===== ADMIN - Restaurant ===== */}
        {/* Trang Danh sách Nhà Hành */}
        <Route path="/restaurants" element={<RestaurantList />} />

        {/* Trang Chi Tiết Nhà Hàng */}
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />

        {/* Trang Danh sách Nhà Hàng (Admin) */}
        <Route
          path="/admin/Restaurant"
          element={
            <AdminLayout>
              <RestaurantManagement />
            </AdminLayout>
          }
        />

        {/* Trang Chi Tiết Nhà Hàng (Admin) */}
        <Route
          path="/admin/EditRestaurant/:id"
          element={
            <AdminLayout>
              <EditRestaurant />
            </AdminLayout>
          }
        />

        {/* Trang Thêm Nhà Hàng (Admin) */}
        <Route
          path="/admin/AddRestaurant"
          element={
            <AdminLayout>
              <AddRestaurant />
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
