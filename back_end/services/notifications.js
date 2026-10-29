const nodemailer = require("nodemailer");

function createEmailTransport() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email is not configured; set EMAIL_USER and EMAIL_PASS");
    }

    const auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    };

    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth
        });
    }

    return nodemailer.createTransport({ service: "gmail", auth });
}

function reminderDate(dueDate) {
    return new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
}

async function sendEmail(user, child, vaccine, reminder) {
    const transport = createEmailTransport();
    const date = reminderDate(reminder.dueDate);

    await transport.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: `Vaccination reminder for ${child.name}`,
        text: `Hello ${user.name},\n\n${child.name} is due for ${vaccine.vaccineName} on ${date}.\n\nPlease confirm the appropriate schedule with your healthcare professional.\n\nE-Vaccine Reminder`
    });
}

async function sendWhatsApp(user, child, vaccine, reminder) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

    if (!token || !phoneNumberId || !templateName) {
        throw new Error(
            "WhatsApp is not configured; set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TEMPLATE_NAME"
        );
    }
    if (!user.phone) {
        throw new Error("Add a phone number with country code to receive WhatsApp reminders");
    }

    const version = process.env.WHATSAPP_API_VERSION || "v23.0";
    const response = await fetch(
        `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: user.phone.replace(/\D/g, ""),
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US"
                    },
                    components: [{
                        type: "body",
                        parameters: [
                            { type: "text", text: child.name },
                            { type: "text", text: vaccine.vaccineName },
                            { type: "text", text: reminderDate(reminder.dueDate) }
                        ]
                    }]
                }
            })
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`WhatsApp API returned ${response.status}: ${errorBody}`);
    }
}

async function deliverReminder(user, child, vaccine, reminder, channels) {
    const results = [];

    if (channels.includes("email") && user.notifications.email && !reminder.emailSentAt) {
        try {
            await sendEmail(user, child, vaccine, reminder);
            reminder.emailSentAt = new Date();
            await reminder.save();
            results.push({ channel: "email", sent: true });
        } catch (error) {
            console.error(`Email reminder ${reminder._id} failed:`, error.message);
            results.push({ channel: "email", sent: false, error: error.message });
        }
    }

    if (channels.includes("whatsapp") &&
        user.notifications.whatsapp &&
        !reminder.whatsappSentAt) {
        try {
            await sendWhatsApp(user, child, vaccine, reminder);
            reminder.whatsappSentAt = new Date();
            await reminder.save();
            results.push({ channel: "whatsapp", sent: true });
        } catch (error) {
            console.error(`WhatsApp reminder ${reminder._id} failed:`, error.message);
            results.push({ channel: "whatsapp", sent: false, error: error.message });
        }
    }

    return results;
}

module.exports = { deliverReminder };
