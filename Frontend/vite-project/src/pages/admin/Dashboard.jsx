import { useEffect, useState } from "react";
import api from "../../api/api";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [userSortBy, setUserSortBy] = useState("name");
  const [userOrder, setUserOrder] = useState("ASC");
  const [storeSortBy, setStoreSortBy] = useState("name");
  const [storeOrder, setStoreOrder] = useState("ASC");

  const [addUserData, setAddUserData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [addStoreData, setAddStoreData] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Dashboard failed");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        params: { ...userFilters, sortBy: userSortBy, order: userOrder },
      });
      setUsers(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Users fetch failed");
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get("/admin/stores", {
        params: { ...storeFilters, sortBy: storeSortBy, order: storeOrder },
      });
      setStores(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Stores fetch failed");
    }
  };

  const viewUserDetails = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "User details failed");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchStores();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userSortBy, userOrder]);

  useEffect(() => {
    fetchStores();
  }, [storeSortBy, storeOrder]);

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/admin/users", addUserData);
      alert("User added successfully");

      setAddUserData({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });

      fetchDashboard();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Add user failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await api.post("/admin/stores", {
        ...addStoreData,
        owner_id: Number(addStoreData.owner_id),
      });

      alert("Store added successfully");

      setAddStoreData({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });

      fetchDashboard();
      fetchStores();
    } catch (error) {
      alert(error.response?.data?.message || "Add store failed");
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (tab) =>
    `px-4 py-2 rounded-lg font-medium ${
      activeTab === tab
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  const owners = users.filter((item) => item.role === "OWNER");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Dashboard
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
          <button onClick={() => setActiveTab("dashboard")} className={tabClass("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveTab("users")} className={tabClass("users")}>Users List</button>
          <button onClick={() => setActiveTab("stores")} className={tabClass("stores")}>Stores List</button>
          <button onClick={() => setActiveTab("addUser")} className={tabClass("addUser")}>Add User</button>
          <button onClick={() => setActiveTab("addStore")} className={tabClass("addStore")}>Add Store</button>
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Total Users</p>
              <h2 className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers}</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Total Stores</p>
              <h2 className="text-4xl font-bold text-green-600 mt-2">{stats.totalStores}</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Total Ratings</p>
              <h2 className="text-4xl font-bold text-yellow-600 mt-2">{stats.totalRatings}</h2>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4"
            >
              <input
                name="name"
                placeholder="Filter by name"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="email"
                placeholder="Filter by email"
                value={userFilters.email}
                onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="address"
                placeholder="Filter by address"
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />

              <select
                name="role"
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
                <option value="OWNER">Owner</option>
              </select>

              <button className="bg-blue-600 text-white rounded-lg px-4 py-2">
                Search
              </button>
            </form>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <div className="p-4 flex gap-4 flex-wrap">
                <select
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="address">Sort by Address</option>
                  <option value="role">Sort by Role</option>
                </select>

                <button
                  onClick={() => setUserOrder(userOrder === "ASC" ? "DESC" : "ASC")}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  {userOrder === "ASC" ? "Ascending" : "Descending"}
                </button>
              </div>

              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-4">{item.name}</td>
                      <td className="p-4">{item.email}</td>
                      <td className="p-4">{item.address}</td>
                      <td className="p-4">{item.role}</td>
                      <td className="p-4">
                        <button
                          onClick={() => viewUserDetails(item.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedUser && (
              <div className="bg-white rounded-xl shadow p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><b>Name:</b> {selectedUser.name}</p>
                  <p><b>Email:</b> {selectedUser.email}</p>
                  <p><b>Address:</b> {selectedUser.address}</p>
                  <p><b>Role:</b> {selectedUser.role}</p>

                  {selectedUser.role === "OWNER" && (
                    <p><b>Store Rating:</b> {selectedUser.rating}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stores" && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchStores();
              }}
              className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input
                name="name"
                placeholder="Filter by store name"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="email"
                placeholder="Filter by email"
                value={storeFilters.email}
                onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />

              <input
                name="address"
                placeholder="Filter by address"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                className="border rounded-lg px-4 py-2"
              />

              <button className="bg-blue-600 text-white rounded-lg px-4 py-2">
                Search
              </button>
            </form>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <div className="p-4 flex gap-4 flex-wrap">
                <select
                  value={storeSortBy}
                  onChange={(e) => setStoreSortBy(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="address">Sort by Address</option>
                  <option value="rating">Sort by Rating</option>
                </select>

                <button
                  onClick={() => setStoreOrder(storeOrder === "ASC" ? "DESC" : "ASC")}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  {storeOrder === "ASC" ? "Ascending" : "Descending"}
                </button>
              </div>

              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-4">Store Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Rating</th>
                  </tr>
                </thead>

                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-t">
                      <td className="p-4">{store.name}</td>
                      <td className="p-4">{store.email}</td>
                      <td className="p-4">{store.address}</td>
                      <td className="p-4">{store.rating}</td>
                    </tr>
                  ))}

                  {stores.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-500">
                        No stores found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "addUser" && (
          <form onSubmit={handleAddUserSubmit} className="bg-white p-6 rounded-xl shadow max-w-2xl">
            <h2 className="text-2xl font-bold mb-5">Add User</h2>

            <input
              name="name"
              placeholder="Name"
              value={addUserData.name}
              onChange={(e) => setAddUserData({ ...addUserData, name: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={addUserData.email}
              onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={addUserData.password}
              onChange={(e) => setAddUserData({ ...addUserData, password: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <textarea
              name="address"
              placeholder="Address"
              value={addUserData.address}
              onChange={(e) => setAddUserData({ ...addUserData, address: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <select
              name="role"
              value={addUserData.role}
              onChange={(e) => setAddUserData({ ...addUserData, role: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Store Owner</option>
            </select>

            <button disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              {loading ? "Adding..." : "Add User"}
            </button>
          </form>
        )}

        {activeTab === "addStore" && (
          <form onSubmit={handleAddStoreSubmit} className="bg-white p-6 rounded-xl shadow max-w-2xl">
            <h2 className="text-2xl font-bold mb-5">Add Store</h2>

            <input
              name="name"
              placeholder="Store Name"
              value={addStoreData.name}
              onChange={(e) => setAddStoreData({ ...addStoreData, name: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Store Email"
              value={addStoreData.email}
              onChange={(e) => setAddStoreData({ ...addStoreData, email: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <textarea
              name="address"
              placeholder="Store Address"
              value={addStoreData.address}
              onChange={(e) => setAddStoreData({ ...addStoreData, address: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            />

            <select
              name="owner_id"
              value={addStoreData.owner_id}
              onChange={(e) => setAddStoreData({ ...addStoreData, owner_id: e.target.value })}
              className="border rounded-lg px-4 py-3 w-full mb-4"
              required
            >
              <option value="">Select Store Owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} - {owner.email}
                </option>
              ))}
            </select>

            <button disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-lg">
              {loading ? "Adding..." : "Add Store"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;