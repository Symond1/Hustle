import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Utility function to send emails
export default async function sendEmail(options) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., "gmail"
        auth: {
            user: process.env.EMAIL_USERNAME, // Your email
            pass: process.env.EMAIL_PASSWORD, // Your app-specific password or service password
        },
    });

    try {
        // Configure and send the email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME, // Sender's email
            to: options.to, // Recipient(s)
            subject: options.subject, // Email subject
            text: options.text, // Plain text email body
            html: options.html, // HTML email body (optional)
        });

        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
}

// Optional test function to verify email functionality
const testEmail = async () => {
    try {
        await sendEmail({
            to: "recipient@example.com", // Replace with a valid recipient email
            subject: "Test Email",
            text: "This is a test email sent from Nodemailer!",
        });
        console.log("Test email sent successfully!");
    } catch (error) {
        console.error("Test email failed:", error);
    }
};


testEmail();
