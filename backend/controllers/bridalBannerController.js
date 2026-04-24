import BridalBanner from "../modal/bridalBannerModal.js";

// @desc    Get Bridal Banner
// @route   GET /api/bridal-banner
// @access  Public
export const getBridalBanner = async (req, res) => {
    try {
        let banner = await BridalBanner.findOne();
        if (!banner) {
            // Create a default one if it doesn't exist
            banner = await BridalBanner.create({});
        }
        res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upsert Bridal Banner
// @route   POST /api/bridal-banner
// @access  Private/Admin
export const upsertBridalBanner = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Handle image if uploaded via multer
        if (req.file) {
            updateData.image = req.file.path;
        }

        const banner = await BridalBanner.findOneAndUpdate({}, updateData, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: "Bridal banner updated successfully",
            data: banner,
        });
    } catch (error) {
        console.error("Error upserting bridal banner:", error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
