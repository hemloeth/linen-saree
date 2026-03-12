import express from "express";
import adminController from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const {
    getDashboardStats,
    getRevenueChart,
    getSalesChart,
    getCustomers,
    getRecentOrders,
} = adminController;

// All admin routes require authentication
// TODO: Add admin role check middleware
router.get("/stats", protect, getDashboardStats);
router.get("/revenue-chart", protect, getRevenueChart);
router.get("/sales-chart", protect, getSalesChart);
router.get("/customers", protect, getCustomers);
router.get("/recent-orders", protect, getRecentOrders);

export default router;
