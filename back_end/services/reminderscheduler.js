const cron = require("node-cron");
const Reminder = require("../models/remminder.js");
const { deliverReminder } = require("./notifications.js");

async function sendDueReminders() {
    const daysBefore = Number(process.env.REMINDER_DAYS_BEFORE || "1");
    if (!Number.isInteger(daysBefore) || daysBefore < 0) {
        throw new Error("REMINDER_DAYS_BEFORE must be a non-negative integer");
    }

    const localTargetDay = new Date();
    localTargetDay.setHours(0, 0, 0, 0);
    localTargetDay.setDate(localTargetDay.getDate() + daysBefore);
    const targetDay = new Date(Date.UTC(
        localTargetDay.getFullYear(),
        localTargetDay.getMonth(),
        localTargetDay.getDate()
    ));
    const endOfTargetDay = new Date(targetDay);
    endOfTargetDay.setUTCDate(endOfTargetDay.getUTCDate() + 1);

    const reminders = await Reminder.find({
        status: "Pending",
        dueDate: { $gte: targetDay, $lt: endOfTargetDay },
        $or: [
            { emailSentAt: null },
            { whatsappSentAt: null }
        ]
    }).populate({
        path: "childId",
        populate: { path: "parentId" }
    }).populate("vaccineId");

    for (const reminder of reminders) {
        const child = reminder.childId;
        const user = child?.parentId;
        const vaccine = reminder.vaccineId;
        if (!user || !vaccine) {
            console.error(`Skipping reminder ${reminder._id}: related records are missing`);
            continue;
        }

        await deliverReminder(user, child, vaccine, reminder, ["email", "whatsapp"]);
    }
}

function startReminderScheduler() {
    const expression = process.env.REMINDER_CRON || "0 9 * * *";
    if (!cron.validate(expression)) {
        throw new Error("REMINDER_CRON must be a valid cron expression");
    }

    cron.schedule(expression, () => {
        sendDueReminders().catch((error) => {
            console.error("Scheduled reminder run failed:", error.message);
        });
    });
    console.log(`Reminder scheduler started with "${expression}"`);
}

module.exports = { sendDueReminders, startReminderScheduler };
