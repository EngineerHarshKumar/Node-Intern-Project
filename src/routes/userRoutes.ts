import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  loginUser
} from "../controllers/userControllers";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router: any = express.Router();

router.post("/create", createUser);
router.post("/login", loginUser )
router.get("/all", getAllUsers);
router.get("/ID/:id", getUserById);
router.put("/update/:id", authenticateJWT, updateUser);
router.delete("/delete/:id", authenticateJWT, deleteUser);

export default router;
