import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "images",
        resource_type: "auto",
        allowedFormats: ["jpg", "jpeg", "png", "gif", "mp4", "webm", "mov", "avi", "mkv"],
    }
})

const upLoadImage = multer({ storage: imageStorage })

export default upLoadImage




