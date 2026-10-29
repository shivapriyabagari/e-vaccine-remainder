const express = require("express");
const User = require("../models/user.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();
router.use(requireAuth);

router.get("/me", async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("name email phone notifications");
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }
        return res.json({ user });
    } catch (error) {
        console.error("Failed to fetch account:", error.message);
        return res.status(500).json({ message: "Failed to fetch account" });
    }
});

module.exports = router;
