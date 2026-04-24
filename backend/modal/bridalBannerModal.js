import mongoose from "mongoose";

const bridalBannerSchema = new mongoose.Schema({
    badge: {
        type: String,
        default: "Best Seller"
    },
    tagline: {
        type: String,
        default: "Bridal Collection"
    },
    titleColorPart: {
        type: String,
        default: "Elegance for Your"
    },
    titleItalicPart: {
        type: String,
        default: "Special Day"
    },
    description: {
        type: String,
        default: "Our bridal collection features exquisite linen sarees adorned with intricate zari work, delicate embroidery, and timeless designs. Each piece is crafted to make your special day truly memorable."
    },
    stat1Number: {
        type: String,
        default: "100+"
    },
    stat1Label: {
        type: String,
        default: "Designs"
    },
    stat2Number: {
        type: String,
        default: "50+"
    },
    stat2Label: {
        type: String,
        default: "Artisans"
    },
    stat3Number: {
        type: String,
        default: "15+"
    },
    stat3Label: {
        type: String,
        default: "Years"
    },
    buttonText: {
        type: String,
        default: "Shop Bridal Collection"
    },
    link: {
        type: String,
        default: "/collections/banarasi-silk"
    },
    image: {
        type: String,
        default: "/images/bridal-saree.jpg"
    }
}, { timestamps: true });

export default mongoose.model("BridalBanner", bridalBannerSchema);
