import { Router } from "express";
import { followOrUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post('/follow/:id', protectRoute, followOrUnfollowUser);
router.get('/suggestedUsers', protectRoute, getSuggestedUsers);
router.post('/update', protectRoute, updateUser);

export default router;
