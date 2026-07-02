import db from "../config/db.js";

export const getOwnerDashboard = async (req, res) => {
  try {
    const [stores] = await db.query(
      `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS averageRating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
      `,
      [req.user.id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: "Store not found for this owner" });
    }

    res.json(stores[0]);
  } catch (error) {
    res.status(500).json({
      message: "Owner dashboard failed",
      error: error.message,
    });
  }
};


export const getOwnerRatings = async (req, res) => {
  try {
    const [ratings] = await db.query(
      `
      SELECT
        u.id AS userId,
        u.name,
        u.email,
        u.address,
        r.rating,
        r.created_at,
        r.updated_at
      FROM stores s
      INNER JOIN ratings r ON s.id = r.store_id
      INNER JOIN users u ON r.user_id = u.id
      WHERE s.owner_id = ?
      ORDER BY r.updated_at DESC
      `,
      [req.user.id]
    );

    res.json(ratings);
  } catch (error) {
    res.status(500).json({
      message: "Owner ratings list failed",
      error: error.message,
    });
  }
};