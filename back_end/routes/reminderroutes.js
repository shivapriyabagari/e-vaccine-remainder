const express = require("express");
const mongoose = require("mongoose");
const Child = require("../models/children.js");
const Reminder = require("../models/remminder.js");
const Vaccine = require("../models/vaccine.js");
const User = require("../models/user.js");
const { deliverReminder } = require("../services/notifications.js");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const children = await Child.find({ parentId: req.user.id }).select("_id");
        const reminders = await Reminder.find({
            childId: { $in: children.map((child) => child._id) }
        }).populate("childId", "name dateOfBirth")
            .populate("vaccineId", "vaccineName description")
            .sort({ dueDate: 1 });
        return res.json(reminders);
    } catch (error) {
        console.error("Failed to fetch reminders:", error.message);
        return res.status(500).json({ message: "Failed to fetch reminders" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { childId, vaccineId, dueDate } = req.body;
        if (!mongoose.isValidObjectId(childId) || !mongoose.isValidObjectId(vaccineId)) {
            return res.status(400).json({ message: "Valid child and vaccine IDs are required" });
        }
        if (typeof dueDate !== "string" || Number.isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ message: "A valid due date is required" });
        }

        const [child, vaccine] = await Promise.all([
            Child.findOne({ _id: childId, parentId: req.user.id }),
            Vaccine.findById(vaccineId)
        ]);
        if (!child) {
            return res.status(404).json({ message: "Child not found" });
        }
        if (!vaccine) {
            return res.status(404).json({ message: "Vaccine not found" });
        }

        const normalizedDueDate = new Date(dueDate);
        if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            normalizedDueDate.setUTCHours(12, 0, 0, 0);
        }
        const reminder = await Reminder.create({
            childId,
            vaccineId,
            dueDate: normalizedDueDate
        });
        const populated = await reminder.populate([
            { path: "childId", select: "name dateOfBirth" },
            { path: "vaccineId", select: "vaccineName description" }
        ]);
        return res.status(201).json(populated);
    } catch (error) {
        console.error("Failed to create reminder:", error.message);
        return res.status(400).json({ message: "Failed to create reminder" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid reminder ID" });
        }
        if (!["Pending", "Completed"].includes(req.body.status)) {
            return res.status(400).json({ message: "Status must be Pending or Completed" });
        }

        const children = await Child.find({ parentId: req.user.id }).select("_id");
        const reminder = await Reminder.findOneAndUpdate(
            {
                _id: req.params.id,
                childId: { $in: children.map((child) => child._id) }
            },
            { $set: { status: req.body.status } },
            { new: true, runValidators: true }
        ).populate("childId", "name dateOfBirth")
            .populate("vaccineId", "vaccineName description");

        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found" });
        }
        return res.json(reminder);
    } catch (error) {
        console.error("Failed to update reminder:", error.message);
        return res.status(500).json({ message: "Failed to update reminder" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid reminder ID" });
        }
        const children = await Child.find({ parentId: req.user.id }).select("_id");
        const reminder = await Reminder.findOneAndDelete({
            _id: req.params.id,
            childId: { $in: children.map((child) => child._id) }
        });
        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found" });
        }
        return res.json({ message: "Reminder deleted" });
    } catch (error) {
        console.error("Failed to delete reminder:", error.message);
        return res.status(500).json({ message: "Failed to delete reminder" });
    }
});

router.post("/:id/send", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid reminder ID" });
        }
        const channels = req.body.channels || ["email", "whatsapp"];
        if (!Array.isArray(channels) ||
            channels.some((channel) => !["email", "whatsapp"].includes(channel))) {
            return res.status(400).json({
                message: "Channels must be email, whatsapp, or both"
            });
        }

        const reminder = await Reminder.findById(req.params.id)
            .populate({ path: "childId", populate: { path: "parentId" } })
            .populate("vaccineId");
        if (!reminder || reminder.childId?.parentId?._id.toString() !== req.user.id) {
            return res.status(404).json({ message: "Reminder not found" });
        }
        if (reminder.status !== "Pending") {
            return res.status(400).json({ message: "Only pending reminders can be sent" });
        }

        const user = await User.findById(req.user.id);
        const results = await deliverReminder(
            user,
            reminder.childId,
            reminder.vaccineId,
            reminder,
            channels
        );
        const failed = results.some((result) => !result.sent);
        return res.status(failed ? 502 : 200).json({
            message: failed ? "One or more notifications failed" : undefined,
            results
        });
    } catch (error) {
        console.error("Failed to send reminder:", error.message);
        return res.status(500).json({ message: "Failed to send reminder" });
    }
});

module.exports = router;
