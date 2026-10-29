
const express = require("express");
const mongoose = require("mongoose");
const Child = require("../models/children.js");
const Reminder = require("../models/remminder.js");

const router = express.Router();

// GET all children
router.get("/", async (req, res) => {
    try {
        const children = await Child.find({ parentId: req.user.id });
        res.json(children);
    } catch (error) {
        console.error("Failed to fetch children:", error.message);
        res.status(500).json({ message: "Failed to fetch children" });
    }
});

// GET one child
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid child ID" });
        }

        const child = await Child.findOne({
            _id: req.params.id,
            parentId: req.user.id
        });

        if (!child) {
            return res.status(404).json({ message: "Child not found" });
        }

        res.json(child);
    } catch (error) {
        console.error("Failed to fetch child:", error.message);
        res.status(500).json({ message: "Failed to fetch child" });
    }
});

// CREATE child
router.post("/", async (req, res) => {
    try {
        const { name, dateOfBirth, gender } = req.body;

        if (typeof name !== "string" ||
            typeof gender !== "string" ||
            !name.trim() ||
            !dateOfBirth ||
            !gender.trim()) {
            return res.status(400).json({
                message: "Name, date of birth and gender are required"
            });
        }

        if (typeof dateOfBirth !== "string" ||
            Number.isNaN(Date.parse(dateOfBirth)) ||
            new Date(dateOfBirth) > new Date()) {
            return res.status(400).json({ message: "Invalid date of birth" });
        }

        const child = await Child.create({
            name: name.trim(),
            dateOfBirth,
            gender: gender.trim(),
            parentId: req.user.id
        });

        res.status(201).json(child);
    } catch (error) {
        console.error("Failed to create child:", error.message);
        res.status(400).json({
            message: "Failed to create child",
            error: error.message
        });
    }
});

// UPDATE child
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid child ID" });
        }

        const { name, dateOfBirth, gender } = req.body;
        const updates = {};
        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ message: "Name cannot be empty" });
            }
            updates.name = name.trim();
        }
        if (dateOfBirth !== undefined) {
            if (typeof dateOfBirth !== "string" ||
                Number.isNaN(Date.parse(dateOfBirth)) ||
                new Date(dateOfBirth) > new Date()) {
                return res.status(400).json({ message: "Invalid date of birth" });
            }
            updates.dateOfBirth = dateOfBirth;
        }
        if (gender !== undefined) {
            if (typeof gender !== "string" || !gender.trim()) {
                return res.status(400).json({ message: "Gender cannot be empty" });
            }
            updates.gender = gender.trim();
        }
        const child = await Child.findOneAndUpdate(
            { _id: req.params.id, parentId: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!child) {
            return res.status(404).json({ message: "Child not found" });
        }

        res.json(child);
    } catch (error) {
        console.error("Failed to update child:", error.message);
        res.status(400).json({ message: "Failed to update child" });
    }
});

// DELETE child
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid child ID" });
        }

        const child = await Child.findOneAndDelete({
            _id: req.params.id,
            parentId: req.user.id
        });

        if (!child) {
            return res.status(404).json({ message: "Child not found" });
        }

        await Reminder.deleteMany({ childId: child._id });
        res.json({ message: "Child and their reminders deleted successfully" });
    } catch (error) {
        console.error("Failed to delete child:", error.message);
        res.status(500).json({ message: "Failed to delete child" });
    }
});

module.exports = router;
