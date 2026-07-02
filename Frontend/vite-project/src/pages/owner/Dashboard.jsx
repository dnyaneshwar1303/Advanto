import { useEffect, useState } from "react";
import api from "../../api/api";

function OwnerDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("dashboard");
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/owner/dashboard");
      setStore(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Owner dashboard failed");
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await api.get("/owner/ratings");
      setRatings(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Ratings fetch failed");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchRatings();
  }, []);

  const updatePassword = async (e) => {
    e.preventDefault();

    try {
      await api.put("/auth/update-password", passwordData);
      alert("Password updated successfully");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Password update failed");
    }
  };

  const tabClass = (tab) =>
    `px-4 py-2 rounded-lg font-medium ${
      activeTab === tab
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Store Owner Dashboard
          </h1>
          <p className="text-gray-500">
            {user?.name} ({user?.role})
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={tabClass("dashboard")}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("ratings")}
            className={tabClass("ratings")}
          >
            Users Ratings
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={tabClass("password")}
          >
            Change Password
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Store Name</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">
                {store?.name || "No Store"}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Average Rating</p>
              <h2 className="text-4xl font-bold text-yellow-600 mt-2">
                {store?.averageRating || 0}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
              <p className="text-gray-500 mb-2">Store Details</p>
              <p>
                <b>Email:</b> {store?.email || "-"}
              </p>
              <p>
                <b>Address:</b> {store?.address || "-"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "ratings" && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-4">User Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Rating</th>
                </tr>
              </thead>

              <tbody>
                {ratings.map((item) => (
                  <tr key={item.userId} className="border-t">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.email}</td>
                    <td className="p-4">{item.address}</td>
                    <td className="p-4">{item.rating}</td>
                  </tr>
                ))}

                {ratings.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No ratings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "password" && (
          <form
            onSubmit={updatePassword}
            className="bg-white p-6 rounded-xl shadow max-w-xl"
          >
            <h2 className="text-2xl font-bold mb-5">Change Password</h2>

            <input
              type="password"
              placeholder="Old Password"
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <p className="text-sm text-gray-500 mb-4">
              Password must be 8-16 characters, include one uppercase letter and
              one special character.
            </p>

            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;