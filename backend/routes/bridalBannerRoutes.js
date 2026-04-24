import express from "express";
import { getBridalBanner, upsertBridalBanner } from "../controllers/bridalBannerController.js";
import upload from "../middlewares/uploadImage.js";

const router = express.Router();

router.route("/")
    .get(getBridalBanner)
    .post(upload.single("image"), upsertBridalBanner);

export default router;
