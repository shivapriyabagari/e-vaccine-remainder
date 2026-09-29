const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        required: true
    },

    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model("Child", childSchema);