"use client";

import { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "../pages/ui/Restaurant/button";
import { Input } from "../pages/ui/Restaurant/input";
import { itinerariesAPI } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../pages/ui/Restaurant/card";

const TripPlanner = () => {
  const [title, setTitle] = useState("");
  const [plans, setPlans] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [smartSuggestions] = useState([
    "Lịch trình 1: Sài Gòn - Vũng Tàu",
    "Lịch trình 2: Hà Nội - Ninh Bình",
    "Lịch trình 3: Huế - Đà Nẵng",
  ]);

  const [newPlan, setNewPlan] = useState({
    destination: "",
    startDate: "",
    endDate: "",
  });

  const [smartPlanForm, setSmartPlanForm] = useState({
    interests: "",
    date: "",
    days: "",
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await itinerariesAPI.getAll();
        const data = response.data;
        const items = response.data.data || [];

        const formatted = items.map((item) => ({
          id: item.id,
          name: item.title || item.destination,
          time: item.time || "9:00 - 11:00",
          image: "image/anh-test.jpg",
          rating: item.rating || 4.5,
          reviews: item.reviews || 0,
        }));

        setSuggestions(formatted);
        console.log("API response data:", response.data);
      } catch (error) {
        console.error("Lỗi khi tải gợi ý lịch trình:", error);
      }
    };

    fetchSuggestions();
  }, []);

  const handleAddPlan = () => {
    if (!newPlan.destination || !newPlan.startDate || !newPlan.endDate) return;
    setPlans([...plans, { ...newPlan, id: Date.now() }]);
    setNewPlan({ destination: "", startDate: "", endDate: "" });
  };

  const handleRemovePlan = (id) => {
    setPlans(plans.filter((plan) => plan.id !== id));
  };

  const addSuggestionToPlan = (suggestion) => {
    const newPlanItem = {
      id: Date.now(),
      destination: suggestion.name,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      time: suggestion.time,
    };
    setPlans([...plans, newPlanItem]);
  };

  const handleCreateSmartSuggestion = () => {
    if (
      !smartPlanForm.interests ||
      !smartPlanForm.date ||
      !smartPlanForm.days
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    alert("Tính năng đang được phát triển!");
  };

  const handleSaveItinerary = async () => {
    if (plans.length === 0) {
      alert("Chưa có lịch trình nào để lưu!");
      return;
    }

    const firstPlan = plans[0]; // hoặc chọn từ form

    try {
      const response = await itinerariesAPI.create({
        user_id: 1,
        title: title ,
        start_date: firstPlan.startDate,
        end_date: firstPlan.endDate,
        budget: 5000000,
        people_count: 2,
        status: "published",
      });

      if (response.status === 201) {
        alert("Lịch trình đã được lưu!");
        setPlans([]);
        setTitle("");
      } else {
        alert("Lỗi khi lưu lịch trình.");
      }
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      console.error("Lỗi chi tiết:", err.response?.data);
      alert("Lỗi: " + JSON.stringify(err.response?.data?.errors));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Banner */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden mb-8">
        <img
          src="image/poster-du-lich.jpg"
          className="w-full h-full object-cover"
          alt="Travel Banner"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">TẠO LỊCH TRÌNH CHO BẠN</h1>
            <p className="text-lg opacity-90">
              Lên kế hoạch và sẵn sàng cho hành trình tuyệt vời
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Tự tạo lịch trình */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Tự tạo lịch trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Địa điểm du lịch"
              value={newPlan.destination}
              onChange={(e) =>
                setNewPlan({ ...newPlan, destination: e.target.value })
              }
            />
            <Input
              type="date"
              value={newPlan.startDate}
              onChange={(e) =>
                setNewPlan({ ...newPlan, startDate: e.target.value })
              }
            />
            <Input
              type="date"
              value={newPlan.endDate}
              onChange={(e) =>
                setNewPlan({ ...newPlan, endDate: e.target.value })
              }
            />
            <Button
              onClick={handleAddPlan}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm vào lịch trình</span>
            </Button>
          </CardContent>
        </Card>

        {/* Gợi ý cho bạn */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Gợi ý cho bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <img
                    src={item.image}
                    className="w-12 h-12 rounded-lg object-cover"
                    alt={item.name}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.time}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addSuggestionToPlan(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gợi ý thông minh */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Gợi ý thông minh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Sở thích"
              value={smartPlanForm.interests}
              onChange={(e) =>
                setSmartPlanForm({
                  ...smartPlanForm,
                  interests: e.target.value,
                })
              }
            />
            <Input
              type="date"
              value={smartPlanForm.date}
              onChange={(e) =>
                setSmartPlanForm({ ...smartPlanForm, date: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Số ngày"
              value={smartPlanForm.days}
              onChange={(e) =>
                setSmartPlanForm({ ...smartPlanForm, days: e.target.value })
              }
            />
            <Button
              onClick={handleCreateSmartSuggestion}
              className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Tạo gợi ý
            </Button>
            <ul className="mt-4 text-green-700">
              {smartSuggestions.map((item, i) => (
                <li key={i} className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Lịch trình hiện tại */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Lịch trình hiện tại
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plans.length === 0 ? (
              <p className="text-gray-500">
                Chưa có lịch trình nào. Hãy thêm địa điểm!
              </p>
            ) : (
              plans.map((plan, index) => (
                <div
                  key={plan.id || index}
                  className="bg-yellow-50 border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {plan.destination}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {plan.startDate} - {plan.endDate}
                    </p>
                    {plan.time && (
                      <p className="text-xs text-gray-500">{plan.time}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePlan(plan.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveItinerary}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lưu lịch trình
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripPlanner;
