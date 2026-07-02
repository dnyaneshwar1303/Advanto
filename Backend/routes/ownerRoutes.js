import express from "express";
import { getOwnerDashboard, getOwnerRatings } from "../controllers/ownerController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("OWNER"));

router.get("/dashboard", getOwnerDashboard);
router.get("/ratings", getOwnerRatings);

export default router;