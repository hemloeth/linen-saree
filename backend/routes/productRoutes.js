import express from "express";
import productController from "../controllers/productController.js";
import upLoadImage from "../middlewares/uploadImage.js";
import upLoadVideo from "../middlewares/uploadVedio.js";
import productModal from "../modal/productModal.js";

const { addProduct, getAllProducts, getProductById, deleteProduct, deleteMultipleProducts, updateProduct, updateGalleryImageInfo, uploadProductVideo } = productController;

const router = express.Router();

router.post("/add-product", upLoadImage.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "videoFile", maxCount: 1 },
]), addProduct);

router.put("/update/:id", upLoadImage.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
    { name: "videoFile", maxCount: 1 },
]), updateProduct);

router.put("/upload-video/:id", upLoadVideo.single("videoFile"), uploadProductVideo);

router.get("/allproducts", getAllProducts);
router.delete("/bulk-delete", deleteMultipleProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);
router.put("/:id/gallery-image-info", updateGalleryImageInfo);

export default router;
