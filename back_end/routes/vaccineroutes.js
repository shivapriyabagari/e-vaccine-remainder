
const express = require("express");
const mongoose = require("mongoose");
const Vaccine = require("../models/vaccine.js");
const Reminder = require("../models/remminder.js");
const requireAuth = require("../middleware/auth.js");

const router = express.Router();

// GET all vaccines
router.get("/", async (req, res) => {
    try {
        const vaccines = await Vaccine.find();
        res.json(vaccines);
    } catch (error) {
        console.error("Failed to fetch vaccines:", error.message);
        res.status(500).json({ message: "Failed to fetch vaccines" });
    }
});

// GET one vaccine
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid vaccine ID" });
        }

        const vaccine = await Vaccine.findById(req.params.id);

        if (!vaccine) {
            return res.status(404).json({ message: "Vaccine not found" });
        }

        res.json(vaccine);
    } catch (error) {
        console.error("Failed to fetch vaccine:", error.message);
        res.status(500).json({ message: "Failed to fetch vaccine" });
    }
});

// CREATE vaccine
router.post("/", requireAuth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Administrator access required" });
    }

    try {
        const { vaccineName, description, recommendedAge, doseNumber } = req.body;
        if (!vaccineName?.trim()) {
            return res.status(400).json({ message: "Vaccine name is required" });
        }

        const vaccine = await Vaccine.create({
            vaccineName: vaccineName.trim(),
            description,
            recommendedAge,
            doseNumber
        });
        return res.status(201).json(vaccine);
    } catch (error) {
        console.error("Failed to create vaccine:", error.message);
        return res.status(400).json({ message: "Failed to create vaccine" });
    }
});

// UPDATE vaccine
router.put("/:id", requireAuth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Administrator access required" });
    }

    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid vaccine ID" });
        }

        const { vaccineName, description, recommendedAge, doseNumber } = req.body;
        const vaccine = await Vaccine.findByIdAndUpdate(
            req.params.id,
            { vaccineName, description, recommendedAge, doseNumber },
            { new: true, runValidators: true }
        );

        if (!vaccine) {
            return res.status(404).json({ message: "Vaccine not found" });
        }

        res.json(vaccine);
    } catch (error) {
        console.error("Failed to update vaccine:", error.message);
        res.status(400).json({ message: "Failed to update vaccine" });
    }
});

// DELETE vaccine
router.delete("/:id", requireAuth, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Administrator access required" });
    }

    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid vaccine ID" });
        }

        const existingVaccine = await Vaccine.findById(req.params.id);
        if (!existingVaccine) {
            return res.status(404).json({ message: "Vaccine not found" });
        }
        if (await Reminder.exists({ vaccineId: existingVaccine._id })) {
            return res.status(409).json({
                message: "Vaccine is used by reminders and cannot be deleted"
            });
        }
        await existingVaccine.deleteOne();
        res.json({ message: "Vaccine deleted successfully" });
    } catch (error) {
        console.error("Failed to delete vaccine:", error.message);
        res.status(500).json({ message: "Failed to delete vaccine" });
    }
});

module.exports = router;
