// src/components/admin/AdminLayout.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../Sidebar"
import Headeradmin from "../../../components/ui/schedule/Headeradmin"


export default function AdminLayout({ children }) {
  const [activeMenu, setActiveMenu] = useState("admin/Restaurant")
  const navigate = useNavigate()

  const handleMenuClick = (path) => {
    setActiveMenu(path)
    navigate(`/${path}`) // hoặc navigate(path) nếu path đã đầy đủ
  }

  return (
    <>
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar bên trái */}
      <Sidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

      {/* Nội dung bên phải */}
      
      <div className="flex-1 p-6 overflow-auto"><Headeradmin></Headeradmin>{children}</div>
    </div>
    </>

  )
}
