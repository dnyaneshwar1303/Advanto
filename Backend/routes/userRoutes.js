import express from "express";
import { getUserStores, submitRating, updateRating } from "../controllers/userController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("USER"));

router.get("/stores", getUserStores);
router.post("/rating", submitRating);
router.put("/rating/:storeId", updateRating);

export default router;