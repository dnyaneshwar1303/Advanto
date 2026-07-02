import db from "../config/db.js";

export const getUserStores = async (req, res) => {
  try {
    const { search = "", sortBy = "name", order = "ASC" } = req.query;

    const allowedSort = ["name", "address", "overallRating"];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : "name";
    const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    let query = `
      SELECT
        s.id,
        s.name,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS overallRating,
        ur.rating AS userRating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur 
        ON s.id = ur.store_id AND ur.user_id = ?
      WHERE s.name LIKE ? OR s.address LIKE ?
      GROUP BY s.id, ur.rating
    `;

    if (sortColumn === "overallRating") {
      query += ` ORDER BY overallRating ${sortOrder}`;
    } else {
      query += ` ORDER BY s.${sortColumn} ${sortOrder}`;
    }

    const [stores] = await db.query(query, [
      req.user.id,
      `%${search}%`,
      `%${search}%`,
    ]);

    res.json(stores);
  } catch (error) {
    res.status(500).json({
      message: "Stores list failed",
      error: error.message,
    });
  }
};

export const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ message: "Store ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [store] = await db.query("SELECT id FROM stores WHERE id = ?", [storeId]);

    if (store.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    const [existingRating] = await db.query(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [req.user.id, storeId]
    );

    if (existingRating.length > 0) {
      return res.status(400).json({
        message: "Rating already submitted. Please update your rating.",
      });
    }

    await db.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
      [req.user.id, storeId, rating]
    );

    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Submit rating failed",
      error: error.message,
    });
  }
};


export const updateRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [existingRating] = await db.query(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [req.user.id, storeId]
    );

    if (existingRating.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    await db.query(
      "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?",
      [rating, req.user.id, storeId]
    );

    res.json({ message: "Rating updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Update rating failed",
      error: error.message,
    });
  }
};