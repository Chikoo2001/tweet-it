import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { deleteNoticiation, deleteNoticiations, getNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.get('/', protectRoute, getNotifications);
router.delete('/', protectRoute, deleteNoticiations)
router.delete('/:id', protectRoute, deleteNoticiation)

export default router;