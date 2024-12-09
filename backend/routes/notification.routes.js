import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { deleteNoticiation, deleteNoticiations, getNoticiations } from "../controllers/notification.controller.js";

const router = Router();

router.get('/', protectRoute, getNoticiations);
router.delete('/', protectRoute, deleteNoticiations)
router.delete('/:id', protectRoute, deleteNoticiation)

export default router;