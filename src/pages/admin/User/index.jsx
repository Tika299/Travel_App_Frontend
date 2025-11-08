"use client"

import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Bell, ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios" // Đảm bảo đã cài: npm install axios
import AddUserForm from "./create"
import EditUserForm from "./edit"

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [currentUser, setCurrentUser] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [showEditUserForm, setShowEditUserForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    today: 0,
  });

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  const stats = [
    { title: "Tổng người dùng", value: statsData.total },
    { title: "Hoạt động", value: statsData.active },
    { title: "Tạm Khóa", value: statsData.inactive },
    { title: "Mới hôm nay", value: statsData.today },
  ];


  const fetchUsers = async () => {
    try {
      await axios.get('https://travel-app-api-ws77.onrender.com/sanctum/csrf-cookie');
      const token = localStorage.getItem("token");

      const [usersRes, statsRes] = await Promise.all([
        axios.get("https://travel-app-api-ws77.onrender.com/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://travel-app-api-ws77.onrender.com/api/users/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersRes.data);
      setStatsData(statsRes.data);
    } catch (err) {
      console.error("Lỗi khi lấy người dùng:", err);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://travel-app-api-ws77.onrender.com/api/user", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUsers(); // giữ nguyên
    fetchCurrentUser(); // thêm dòng này
  }, []);



  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
      setSelectAll(false)
    } else {
      setSelectedUsers(users.map((user) => user.id))
      setSelectAll(true)
    }
  }

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa các người dùng đã chọn?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          'https://travel-app-api-ws77.onrender.com/api/users/delete-multiple',
          { ids: selectedUsers },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        await fetchUsers();


        // Cập nhật lại danh sách sau khi xóa
        setUsers(users.filter(user => !selectedUsers.includes(user.id)));
        await fetchUsers();
        setSelectedUsers([]);
        setSelectAll(false);
        setIsSelectionMode(false);
      } catch (err) {
        console.error("Lỗi khi xóa hàng loạt:", err);
        alert("Xóa thất bại!");
      }
    }
  };


  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditUserForm(true)
  }

  const handleCloseEditForm = () => {
    setShowEditUserForm(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://travel-app-api-ws77.onrender.com/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        await fetchUsers();
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error("Lỗi khi xóa người dùng:", err);
        alert("Xóa thất bại!");
      }
    }
  }


  if (showAddUserForm) {
    return <AddUserForm onClose={() => setShowAddUserForm(false)} />
  }

  if (showEditUserForm) {
    return <EditUserForm user={selectedUser} onClose={handleCloseEditForm} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Quản lý người dùng</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                  {currentUser?.avatar ? (
                    <img
                      src={`https://travelappdeloy.vercel.app/${currentUser.avatar}`}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {currentUser?.name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.name || "Admin"}
                </span>

              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
                  <button
                    onClick={() => window.location.href = "/"}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Trang chủ
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token"); // hoặc xử lý logout khác nếu cần
                      window.location.href = "/login";   // chuyển về trang login
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header> */}

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white shadow-sm rounded-lg border">
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{stat.title}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm người dùng (id, tên)..."
              className="pl-10 w-full px-3 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
              onClick={() => setIsSelectionMode(!isSelectionMode)}
            >
              Chọn xóa
            </button>

            <button
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
              onClick={fetchUsers}
            >
              Làm mới
            </button>

            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center"
              onClick={() => setShowAddUserForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </button>
          </div>

        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {isSelectionMode && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tham gia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {isSelectionMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={`https://travelappdeloy.vercel.app/${user.avatar}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-medium">{user.name.charAt(0)}</span>
                          )}
                        </div>

                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.id.toString().padStart(3, "0")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role.toLowerCase() === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {user.role}
                      </span>

                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate">{user.bio}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-1 mt-6">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded min-w-[32px]">1</button>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded min-w-[32px]">2</button>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded min-w-[32px]">3</button>
          <span className="text-gray-500 px-2">...</span>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded min-w-[32px]">19</button>
          <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">Tiếp</button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Delete Button */}
      {isSelectionMode && selectedUsers.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-lg flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}

export default UserManagement
