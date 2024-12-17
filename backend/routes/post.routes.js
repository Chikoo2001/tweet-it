import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeOrUnlikePost,
} from "../controllers/post.controller.js";

const router = Router();

router.post("/create", protectRoute, createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/like/:id", protectRoute, likeOrUnlikePost);
router.get("/", protectRoute, getAllPosts);
router.get("/liked/:id", protectRoute, getLikedPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:id", protectRoute, getUserPosts);
export default router;
