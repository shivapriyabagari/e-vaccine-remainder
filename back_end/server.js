require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const requireAuth = require("./middleware/auth.js");
const Vaccine = require("./models/vaccine.js");
const { startReminderScheduler } = require("./services/reminderscheduler.js");

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
    console.warn("JWT_SECRET is unset; sessions will expire when the server restarts");
}

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
    if (req.body === undefined) req.body = {};
    next();
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "e-vaccine-reminder" });
});

app.use("/api/auth", require("./routes/authroutes.js"));
app.use("/api/users", require("./routes/userrouts.js"));
app.use("/api/vaccines", require("./routes/vaccineroutes.js"));
app.use("/api/children", requireAuth, require("./routes/childrenroutes.js"));
app.use("/api/reminders", requireAuth, require("./routes/reminderroutes.js"));

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

async function seedVaccineCatalog() {
    if (await Vaccine.exists()) return;

    await Vaccine.insertMany([
        {
            vaccineName: "BCG",
            description: "Ask a healthcare professional about BCG vaccination."
        },
        {
            vaccineName: "Hepatitis B",
            description: "Ask a healthcare professional about Hepatitis B vaccination."
        },
        {
            vaccineName: "Polio",
            description: "Ask a healthcare professional about polio vaccination."
        },
        {
            vaccineName: "DTP",
            description: "Ask a healthcare professional about DTP vaccination."
        },
        {
            vaccineName: "MMR",
            description: "Ask a healthcare professional about MMR vaccination."
        }
    ]);
}

async function startServer() {
    const port = process.env.PORT || 5000;
    const mongoUri = process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/e_vaccine_reminder";

    try {
        await mongoose.connect(mongoUri);
        await seedVaccineCatalog();
        startReminderScheduler();
        const server = app.listen(port, () => {
            console.log(`E-Vaccine Reminder API listening on http://localhost:${port}`);
        });
        return server;
    } catch (error) {
        console.error("Failed to start backend:", error.message);
        throw error;
    }
}

if (require.main === module) {
    startServer().catch(() => {
        process.exitCode = 1;
    });
}

module.exports = { app, startServer };
