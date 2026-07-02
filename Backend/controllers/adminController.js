import bcrypt from "bcryptjs";
import db from "../config/db.js";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
  return /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password);
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [[userCount]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[storeCount]] = await db.query("SELECT COUNT(*) AS totalStores FROM stores");
    const [[ratingCount]] = await db.query("SELECT COUNT(*) AS totalRatings FROM ratings");

    res.json({
      totalUsers: userCount.totalUsers,
      totalStores: storeCount.totalStores,
      totalRatings: ratingCount.totalRatings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Dashboard data failed",
      error: error.message,
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["ADMIN", "USER", "OWNER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: "Name must be 20 to 60 characters" });
    }

    if (address.length > 400) {
      return res.status(400).json({ message: "Address must be maximum 400 characters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters with at least one uppercase letter and one special character",
      });
    }

    const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Add user failed",
      error: error.message,
    });
  }
};

export const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || !email || !address || !owner_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (address.length > 400) {
      return res.status(400).json({ message: "Address must be maximum 400 characters" });
    }

    const [owner] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'OWNER'",
      [owner_id]
    );

    if (owner.length === 0) {
      return res.status(400).json({ message: "Valid store owner not found" });
    }

    const [existingStore] = await db.query(
      "SELECT id FROM stores WHERE email = ? OR owner_id = ?",
      [email, owner_id]
    );

    if (existingStore.length > 0) {
      return res.status(400).json({
        message: "Store email already exists or owner already has a store",
      });
    }

    await db.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address, owner_id]
    );

    res.status(201).json({ message: "Store added successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Add store failed",
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = "name", order = "ASC" } = req.query;

    const allowedSort = ["name", "email", "address", "role"];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : "name";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let query = `
      SELECT id, name, email, address, role
      FROM users
      WHERE 1=1
    `;

    const values = [];

    if (name) {
      query += " AND name LIKE ?";
      values.push(`%${name}%`);
    }

    if (email) {
      query += " AND email LIKE ?";
      values.push(`%${email}%`);
    }

    if (address) {
      query += " AND address LIKE ?";
      values.push(`%${address}%`);
    }

    if (role) {
      query += " AND role = ?";
      values.push(role);
    }

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [users] = await db.query(query, values);

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Users list failed",
      error: error.message,
    });
  }
};

export const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = "name", order = "ASC" } = req.query;

    const allowedSort = ["name", "email", "address", "rating"];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : "name";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const values = [];

    if (name) {
      query += " AND s.name LIKE ?";
      values.push(`%${name}%`);
    }

    if (email) {
      query += " AND s.email LIKE ?";
      values.push(`%${email}%`);
    }

    if (address) {
      query += " AND s.address LIKE ?";
      values.push(`%${address}%`);
    }

    query += " GROUP BY s.id";

    if (sortColumn === "rating") {
      query += ` ORDER BY rating ${sortOrder}`;
    } else {
      query += ` ORDER BY s.${sortColumn} ${sortOrder}`;
    }

    const [stores] = await db.query(query, values);

    res.json(stores);
  } catch (error) {
    res.status(500).json({
      message: "Stores list failed",
      error: error.message,
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (user.role === "OWNER") {
      const [storeRating] = await db.query(
        `
        SELECT COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.owner_id = ?
        `,
        [id]
      );

      user.rating = storeRating[0].rating;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "User details failed",
      error: error.message,
    });
  }
};