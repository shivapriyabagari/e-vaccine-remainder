const express = require("express");
const User = require("../models/user.js");

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "Error getting users"
        });
    }
});

// GET one user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Error getting user"
        });
    }
});

// UPDATE user
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Error updating user"
        });
    }
});

// DELETE user
router.delete("/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user"
        });
    }
});

module.exports = router;