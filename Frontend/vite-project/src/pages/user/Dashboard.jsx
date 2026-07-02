import { useEffect, useState } from "react";
import api from "../../api/api";

function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("stores");
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("ASC");
  const [ratings, setRatings] = useState({});

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const fetchStores = async () => {
    try {
      const res = await api.get("/user/stores", {
        params: { search, sortBy, order },
      });
      setStores(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Stores fetch failed");
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleRatingChange = (storeId, value) => {
    setRatings({
      ...ratings,
      [storeId]: value,
    });
  };

  const submitOrUpdateRating = async (store) => {
    const rating = Number(ratings[store.id]);

    if (!rating || rating < 1 || rating > 5) {
      alert("Please select rating between 1 to 5");
      return;
    }

    try {
      if (store.userRating) {
        await api.put(`/user/rating/${store.id}`, { rating });
        alert("Rating updated successfully");
      } else {
        await api.post("/user/rating", {
          storeId: store.id,
          rating,
        });
        alert("Rating submitted successfully");
      }

      setRatings({});
      fetchStores();
    } catch (error) {
      alert(error.response?.data?.message || "Rating failed");
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
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
          <button onClick={() => setActiveTab("stores")} className={tabClass("stores")}>
            Stores
          </button>

          <button onClick={() => setActiveTab("password")} className={tabClass("password")}>
            Change Password
          </button>
        </div>

        {activeTab === "stores" && (
          <div>
            <form
              onSubmit={handleSearch}
              className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input
                placeholder="Search by store name or address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 md:col-span-2"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="name">Sort by Name</option>
                <option value="address">Sort by Address</option>
                <option value="overallRating">Sort by Rating</option>
              </select>

              <button className="bg-blue-600 text-white rounded-lg px-4 py-2">
                Search
              </button>
            </form>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <div className="p-4">
                <button
                  onClick={() => setOrder(order === "ASC" ? "DESC" : "ASC")}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  {order === "ASC" ? "Ascending" : "Descending"}
                </button>
              </div>

              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-4">Store Name</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Overall Rating</th>
                    <th className="p-4">Your Rating</th>
                    <th className="p-4">Submit / Update</th>
                  </tr>
                </thead>

                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-t">
                      <td className="p-4">{store.name}</td>
                      <td className="p-4">{store.address}</td>
                      <td className="p-4">{store.overallRating}</td>
                      <td className="p-4">{store.userRating || "Not rated"}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <select
                            value={ratings[store.id] || store.userRating || ""}
                            onChange={(e) =>
                              handleRatingChange(store.id, e.target.value)
                            }
                            className="border rounded-lg px-3 py-2"
                          >
                            <option value="">Select</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>

                          <button
                            onClick={() => submitOrUpdateRating(store)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg"
                          >
                            {store.userRating ? "Update" : "Submit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {stores.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500">
                        No stores found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              Password must be 8-16 characters, include one uppercase letter and one special character.
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

export default UserDashboard;