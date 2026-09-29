const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
    vaccineName: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    recommendedAge: {
        type: String
    },

    doseNumber: {
        type: Number
    }
});

module.exports = mongoose.model("Vaccine", vaccineSchema);