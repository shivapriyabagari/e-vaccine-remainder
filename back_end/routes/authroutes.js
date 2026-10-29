const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

function createToken(user) {
    return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
        subject: user._id.toString(),
        expiresIn: "7d"
    });
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        notifications: user.notifications
    };
}

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, notifications } = req.body;

        if (typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ message: "Enter a valid email address" });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const wantsWhatsApp = notifications?.whatsapp === true;
        if (wantsWhatsApp &&
            (typeof phone !== "string" || !/^\+?[1-9]\d{7,14}$/.test(phone.trim()))) {
            return res.status(400).json({
                message: "Enter a valid phone number with country code for WhatsApp"
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            phone: phone?.trim(),
            notifications: {
                email: notifications?.email !== false,
                whatsapp: wantsWhatsApp
            }
        });

        return res.status(201).json({
            token: createToken(user),
            user: publicUser(user)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email is already registered" });
        }
        console.error("Registration failed:", error.message);
        return res.status(500).json({ message: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Email or password is incorrect" });
        }

        return res.json({ token: createToken(user), user: publicUser(user) });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Login failed" });
    }
});

router.get("/me", requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Account not found" });
        }
        return res.json({ user: publicUser(user) });
    } catch (error) {
        console.error("Failed to load account:", error.message);
        return res.status(500).json({ message: "Failed to load account" });
    }
});

router.put("/me", requireAuth, async (req, res) => {
    try {
        const { name, phone, notifications } = req.body;
        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({ message: "Name cannot be empty" });
        }
        if (phone !== undefined && typeof phone !== "string") {
            return res.status(400).json({ message: "Phone number must be text" });
        }

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: "Account not found" });
        }

        const updatedPhone = phone === undefined ? currentUser.phone : phone.trim();
        const updatedNotifications = {
            email: notifications?.email ?? currentUser.notifications.email,
            whatsapp: notifications?.whatsapp ?? currentUser.notifications.whatsapp
        };
        if (updatedNotifications.whatsapp &&
            !/^\+?[1-9]\d{7,14}$/.test(updatedPhone || "")) {
            return res.status(400).json({
                message: "Enter a valid phone number with country code for WhatsApp"
            });
        }

        currentUser.name = name === undefined ? currentUser.name : name.trim();
        currentUser.phone = updatedPhone;
        currentUser.notifications = updatedNotifications;
        await currentUser.save();
        return res.json({ user: publicUser(currentUser) });
    } catch (error) {
        console.error("Failed to update account:", error.message);
        return res.status(500).json({ message: "Failed to update account" });
    }
});

module.exports = router;
