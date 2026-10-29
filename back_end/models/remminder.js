const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true
    },

    vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vaccine",
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    },

    emailSentAt: {
        type: Date,
        default: null
    },

    whatsappSentAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);