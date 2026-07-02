import express from "express";
import {
  addStore,
  addUser,
  getAdminDashboard,
  getStores,
  getUserDetails,
  getUsers,
} from "../controllers/adminController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("ADMIN"));

router.get("/dashboard", getAdminDashboard);
router.post("/users", addUser);
router.post("/stores", addStore);
router.get("/users", getUsers);
router.get("/stores", getStores);
router.get("/users/:id", getUserDetails);

export default router;